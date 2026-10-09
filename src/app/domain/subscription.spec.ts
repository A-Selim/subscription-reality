import {
  isReviewCandidate,
  reviewCandidates,
  reviewCandidateAnnualCostPerCurrency,
  joinAmounts,
  REASONS,
  USAGES,
  potentialSavings,
  potentialSavingsPerCurrency,
  decisionCounts,
  reviewQueue,
  nextInReviewAgainPass,
  annualCost,
  recurringCost,
  recurringCostPerCurrency,
  isRarelyUsed,
  rarelyUsedCount,
  findSubscriptionNameMatch,
  isValidName,
  isValidPrice,
  NAME_MAX_LENGTH,
  estimateUsage,
  usageAfterReasonEdit,
  formatAnnualMoney,
  formatMoney,
  monthlyCost,
  monogram,
  type Currency,
  type Reason,
  type Subscription,
  type Usage,
} from './subscription';

describe('Subscription costs', () => {
  it('calculates Monthly cost and Annual cost for monthly billing frequency', () => {
    const subscription = { price: 9.99, billingFrequency: 'monthly' } as const;

    expect(monthlyCost(subscription)).toBe(9.99);
    expect(annualCost(subscription)).toBeCloseTo(119.88);
  });

  it('calculates Monthly cost and Annual cost for yearly billing frequency', () => {
    const subscription = { price: 60, billingFrequency: 'yearly' } as const;

    expect(monthlyCost(subscription)).toBe(5);
    expect(annualCost(subscription)).toBe(60);
  });
});

describe('money formatting', () => {
  it.each<readonly [Currency, string, string]>([
    ['EUR', '€9.99', '€10'],
    ['USD', '$9.99', '$10'],
    ['GBP', '£9.99', '£10'],
    ['EGP', 'E£9.99', 'E£10'],
  ])('formats %s with its symbol and fixed decimal rules', (currency, price, annual) => {
    expect(formatMoney(9.99, currency)).toBe(price);
    expect(formatAnnualMoney(9.99, currency)).toBe(annual);
  });

  it('formats annual cost in whole units and keeps a tiny non-zero amount visible', () => {
    expect(formatAnnualMoney(annualCost({ price: 9.99, billingFrequency: 'monthly' }), 'EUR')).toBe(
      '€120',
    );
    expect(formatAnnualMoney(annualCost({ price: 0.4, billingFrequency: 'yearly' }), 'EUR')).toBe(
      '€0.40',
    );
    expect(formatAnnualMoney(0, 'EUR')).toBe('€0');
  });

  it('keeps cents below the whole-unit rounding boundary', () => {
    expect(formatAnnualMoney(0.49, 'EUR')).toBe('€0.49');
    expect(formatAnnualMoney(0.5, 'EUR')).toBe('€1');
  });

  it('groups thousands in en-US style', () => {
    expect(formatMoney(1234.5, 'EUR')).toBe('€1,234.50');
  });
});

describe('monogram', () => {
  it('uses the first two name characters in uppercase', () => {
    expect(monogram('netflix')).toBe('NE');
  });
});

describe('estimateUsage', () => {
  const cases: ReadonlyArray<[Reason, Usage]> = [
    ['Essential', 'Daily'],
    ['High Value', 'Daily'],
    ['Work / Learning', 'Daily'],
    ['Convenience', 'Weekly'],
    ['Nice to Have', 'Monthly'],
    ['Occasional Use', 'Rarely'],
  ];

  it.each(cases)('estimates %s as %s', (reason, usage) => {
    expect(estimateUsage(reason)).toBe(usage);
  });

  it('never estimates Almost Never for any Reason', () => {
    for (const [reason] of cases) {
      expect(estimateUsage(reason)).not.toBe('Almost Never');
    }
  });
});

describe('Usage after editing Reason', () => {
  const subscription = { reason: 'Essential', usage: 'Daily', usageConfirmed: false } as const;

  it('re-estimates Usage when the Reason changes and Usage is unconfirmed', () => {
    expect(usageAfterReasonEdit(subscription, 'Occasional Use')).toBe('Rarely');
    expect(subscription.usage).toBe('Daily');
  });

  it('keeps confirmed Usage when the Reason changes', () => {
    expect(usageAfterReasonEdit({ ...subscription, usageConfirmed: true }, 'Occasional Use')).toBe(
      'Daily',
    );
  });

  it('keeps unconfirmed Usage when the Reason is unchanged', () => {
    expect(usageAfterReasonEdit({ ...subscription, usage: 'Weekly' }, 'Essential')).toBe('Weekly');
  });
});

describe('subscription validation', () => {
  it.each([0, -1, 9.999, 0.001, NaN, Infinity, -Infinity])('refuses price %s', (price) => {
    expect(isValidPrice(price)).toBe(false);
  });

  it.each([9.99, 1.1, 0.07, 10, 0.01])(
    'accepts price %s without floating-point errors',
    (price) => {
      expect(isValidPrice(price)).toBe(true);
    },
  );

  it.each(['', '   ', 'a'.repeat(41)])('refuses invalid name %j', (name) => {
    expect(isValidName(name)).toBe(false);
  });

  it('accepts 40 characters and measures the trimmed name', () => {
    expect(NAME_MAX_LENGTH).toBe(40);
    expect(isValidName('a'.repeat(40))).toBe(true);
    expect(isValidName(`  ${'a'.repeat(40)}  `)).toBe(true);
  });
});

describe('subscription name uniqueness', () => {
  const netflix: Subscription = {
    id: 'netflix',
    sequence: 0,
    name: 'Netflix',
    price: 9.99,
    billingFrequency: 'monthly',
    currency: 'EUR',
    reason: 'Essential',
    usage: 'Daily',
    usageConfirmed: false,
    decision: null,
  };

  it.each(['netflix', ' NETFLIX '])('finds a match for %j', (candidateName) => {
    expect(findSubscriptionNameMatch([netflix], candidateName)).toBe(netflix);
  });

  it('does not match a distinct subscription name', () => {
    expect(findSubscriptionNameMatch([netflix], 'Netflix Family')).toBeUndefined();
  });

  it('excludes the subscription being edited', () => {
    const spotify = { ...netflix, id: 'spotify', name: 'Spotify' };
    expect(findSubscriptionNameMatch([netflix, spotify], ' NETFLIX ', netflix.id)).toBeUndefined();
    expect(findSubscriptionNameMatch([netflix, spotify], ' spotify ', netflix.id)).toBe(spotify);
  });
});

describe('Recurring cost', () => {
  it('sums monthly and yearly subscriptions as annual and monthly costs', () => {
    expect(
      recurringCost([
        { price: 10, billingFrequency: 'monthly' },
        { price: 60, billingFrequency: 'yearly' },
      ]),
    ).toEqual({ annual: 180, monthly: 15 });
  });

  it('has zero recurring cost without subscriptions', () => {
    expect(recurringCost([])).toEqual({ annual: 0, monthly: 0 });
  });
});

describe('Rarely used subscriptions', () => {
  it.each<readonly [Usage, boolean]>([
    ['Daily', false],
    ['Weekly', false],
    ['Monthly', false],
    ['Rarely', true],
    ['Almost Never', true],
  ])('checks %s usage', (usage, expected) => {
    expect(isRarelyUsed({ usage })).toBe(expected);
  });

  it('counts Rarely and Almost Never usage', () => {
    expect(
      rarelyUsedCount([{ usage: 'Daily' }, { usage: 'Rarely' }, { usage: 'Almost Never' }]),
    ).toBe(2);
    expect(rarelyUsedCount([])).toBe(0);
  });
});

describe('Recurring cost per currency', () => {
  function subscription(overrides: Partial<Subscription>): Subscription {
    return {
      id: 'subscription',
      sequence: 0,
      name: 'Subscription',
      price: 10,
      billingFrequency: 'monthly',
      currency: 'EUR',
      reason: 'Essential',
      usage: 'Daily',
      usageConfirmed: false,
      decision: null,
      ...overrides,
    };
  }

  it('keeps totals and subscription and Rarely used counts separate per currency', () => {
    expect(
      recurringCostPerCurrency([
        subscription({ sequence: 0, usage: 'Rarely' }),
        subscription({
          sequence: 1,
          currency: 'USD',
          price: 24,
          billingFrequency: 'yearly',
          usage: 'Almost Never',
          usageConfirmed: true,
        }),
        subscription({ sequence: 2, price: 60, billingFrequency: 'yearly', decision: 'cancel' }),
      ]),
    ).toEqual([
      {
        currency: 'EUR',
        annual: 180,
        monthly: 15,
        subscriptionCount: 2,
        rarelyUsedCount: 1,
        annualAfterCancel: 120,
      },
      {
        currency: 'USD',
        annual: 24,
        monthly: 2,
        subscriptionCount: 1,
        rarelyUsedCount: 1,
        annualAfterCancel: 24,
      },
    ]);
  });

  it('calculates the annual cost after Cancel decisions per currency', () => {
    expect(
      recurringCostPerCurrency([
        subscription({ sequence: 0, price: 10, billingFrequency: 'monthly', decision: 'cancel' }),
        subscription({ sequence: 1, price: 60, billingFrequency: 'yearly' }),
        subscription({
          sequence: 2,
          currency: 'USD',
          price: 24,
          billingFrequency: 'yearly',
          decision: 'cancel',
        }),
        subscription({ sequence: 3, currency: 'USD', price: 12, billingFrequency: 'yearly' }),
      ]).map(({ currency, annualAfterCancel }) => ({ currency, annualAfterCancel })),
    ).toEqual([
      { currency: 'EUR', annualAfterCancel: 60 },
      { currency: 'USD', annualAfterCancel: 12 },
    ]);
  });

  it('orders currencies by their lowest sequence independently of array order', () => {
    const subscriptions = [
      subscription({ sequence: 8 }),
      subscription({ sequence: 4, currency: 'USD' }),
      subscription({ sequence: 2 }),
    ];
    expect(recurringCostPerCurrency(subscriptions).map((cost) => cost.currency)).toEqual([
      'EUR',
      'USD',
    ]);
    expect(subscriptions.map((item) => item.sequence)).toEqual([8, 4, 2]);
  });

  it('omits currencies without subscriptions', () => {
    expect(recurringCostPerCurrency([])).toEqual([]);
    expect(recurringCostPerCurrency([subscription({})]).map((cost) => cost.currency)).toEqual([
      'EUR',
    ]);
  });

  it('puts a re-used currency after currencies with earlier current subscriptions', () => {
    const earlierEuro = subscription({ sequence: 0 });
    const dollar = subscription({ sequence: 1, currency: 'USD' });
    expect(recurringCostPerCurrency([earlierEuro, dollar]).map((cost) => cost.currency)).toEqual([
      'EUR',
      'USD',
    ]);
    expect(recurringCostPerCurrency([dollar]).map((cost) => cost.currency)).toEqual(['USD']);
    expect(
      recurringCostPerCurrency([subscription({ sequence: 5 }), dollar]).map(
        (cost) => cost.currency,
      ),
    ).toEqual(['USD', 'EUR']);
  });
});

describe('Review queue', () => {
  it('lists undecided subscriptions in insertion order and skips decided ones without changing the input', () => {
    const base: Subscription = {
      id: 'first',
      sequence: 1,
      name: 'First',
      price: 10,
      billingFrequency: 'monthly',
      currency: 'EUR',
      reason: 'Essential',
      usage: 'Daily',
      usageConfirmed: false,
      decision: null,
    };
    const later = { ...base, id: 'later', sequence: 8 };
    const subscriptions: Subscription[] = [
      later,
      { ...base, sequence: 0, decision: 'keep' },
      base,
      { ...base, decision: 'unsure' },
      { ...base, decision: 'cancel' },
    ];
    expect(reviewQueue(subscriptions)).toEqual([base, later]);
    expect(subscriptions[0]).toBe(later);
    expect(reviewQueue([])).toEqual([]);
  });
});

describe('Review again pass', () => {
  const first: Subscription = {
    id: 'first',
    sequence: 0,
    name: 'First',
    price: 10,
    billingFrequency: 'monthly',
    currency: 'EUR',
    reason: 'Essential',
    usage: 'Daily',
    usageConfirmed: true,
    decision: 'keep',
  };
  const second = { ...first, id: 'second', sequence: 2 };
  const third = { ...first, id: 'third', sequence: 4 };

  it('selects every subscription in sequence order without changing the input', () => {
    const subscriptions = [third, first, second];
    expect(nextInReviewAgainPass(subscriptions, -1)).toBe(first);
    expect(nextInReviewAgainPass(subscriptions, 0)).toBe(second);
    expect(nextInReviewAgainPass(subscriptions, 2)).toBe(third);
    expect(nextInReviewAgainPass(subscriptions, 4)).toBeUndefined();
    expect(nextInReviewAgainPass([], -1)).toBeUndefined();
    expect(subscriptions).toEqual([third, first, second]);
  });

  it('skips deleted subscriptions even when the cursor subscription is gone', () => {
    expect(nextInReviewAgainPass([first, third], 0)).toBe(third);
    expect(nextInReviewAgainPass([third], 2)).toBe(third);
  });

  it('picks up a newly added undecided subscription from the live list', () => {
    expect(nextInReviewAgainPass([first, second], 2)).toBeUndefined();
    const added = { ...third, decision: null };
    expect(nextInReviewAgainPass([first, second, added], 2)).toBe(added);
  });
});

describe('Potential savings and Review decision counts', () => {
  function subscription(overrides: Partial<Subscription> = {}): Subscription {
    return {
      id: 'subscription',
      sequence: 0,
      name: 'Subscription',
      price: 10,
      billingFrequency: 'monthly',
      currency: 'EUR',
      reason: 'Essential',
      usage: 'Daily',
      usageConfirmed: false,
      decision: null,
      ...overrides,
    };
  }

  it('includes zero entries in first-used currency order without changing the input', () => {
    const subscriptions = [
      subscription({ sequence: 8 }),
      subscription({ sequence: 2, currency: 'USD' }),
    ];
    expect(potentialSavingsPerCurrency(subscriptions)).toEqual([
      { currency: 'USD', amount: 0 },
      { currency: 'EUR', amount: 0 },
    ]);
    expect(subscriptions.map((entry) => entry.sequence)).toEqual([8, 2]);
    expect(potentialSavingsPerCurrency([])).toEqual([]);
  });

  it('sums only Cancel annual costs separately per currency', () => {
    expect(
      potentialSavingsPerCurrency([
        subscription({ decision: 'cancel' }),
        subscription({ sequence: 1, decision: 'unsure', price: 50 }),
        subscription({ sequence: 2, decision: 'keep', price: 50 }),
        subscription({ sequence: 3, decision: 'cancel', billingFrequency: 'yearly', price: 60 }),
        subscription({
          sequence: 4,
          currency: 'USD',
          decision: 'cancel',
          billingFrequency: 'yearly',
          price: 24,
        }),
        subscription({ sequence: 5, currency: 'GBP' }),
      ]),
    ).toEqual([
      { currency: 'EUR', amount: 180 },
      { currency: 'USD', amount: 24 },
      { currency: 'GBP', amount: 0 },
    ]);
  });

  it('sums only Cancel annual costs for a subscription group', () => {
    expect(
      potentialSavings([
        subscription({ decision: 'cancel' }),
        subscription({ decision: 'unsure', price: 50 }),
        subscription({ decision: 'keep', price: 50 }),
        subscription({ decision: 'cancel', billingFrequency: 'yearly', price: 60 }),
      ]),
    ).toBe(180);
    expect(potentialSavings([])).toBe(0);
  });

  it('counts Review decisions across currencies and excludes undecided subscriptions', () => {
    expect(
      decisionCounts([
        subscription({ decision: 'keep' }),
        subscription({ currency: 'USD', decision: 'keep' }),
        subscription({ decision: 'unsure' }),
        subscription({ currency: 'GBP', decision: 'cancel' }),
        subscription(),
      ]),
    ).toEqual({ keep: 2, unsure: 1, cancel: 1 });
    expect(decisionCounts([])).toEqual({ keep: 0, unsure: 0, cancel: 0 });
  });
});

describe('Review candidates', () => {
  const candidate: Subscription = {
    id: 'candidate',
    sequence: 0,
    name: 'Adobe',
    price: 10,
    billingFrequency: 'monthly',
    currency: 'EUR',
    reason: 'Occasional Use',
    usage: 'Rarely',
    usageConfirmed: false,
    decision: null,
  };

  it.each(REASONS.flatMap((reason) => USAGES.map((usage) => ({ reason, usage }))))(
    'checks $reason with $usage',
    ({ reason, usage }) => {
      const expected =
        ['Nice to Have', 'Convenience', 'Occasional Use'].includes(reason) &&
        ['Rarely', 'Almost Never'].includes(usage);
      expect(isReviewCandidate({ reason, usage })).toBe(expected);
    },
  );

  it('lists candidates in insertion order regardless of Review decision or usage confirmation', () => {
    const later = { ...candidate, sequence: 2, decision: 'keep' as const, usageConfirmed: true };
    const subscriptions = [later, { ...candidate, usage: 'Daily' as const }, candidate];
    expect(reviewCandidates(subscriptions)).toEqual([candidate, later]);
    expect(subscriptions[0]).toBe(later);
    expect(reviewCandidates([])).toEqual([]);
  });

  it('sums candidate annual costs per currency and omits non-candidates', () => {
    const subscriptions: Subscription[] = [
      { ...candidate, sequence: 3, currency: 'USD', price: 5 },
      candidate,
      { ...candidate, sequence: 1, billingFrequency: 'yearly', price: 40 },
      { ...candidate, sequence: 2, currency: 'GBP', reason: 'Essential' },
    ];
    expect(
      reviewCandidateAnnualCostPerCurrency(reviewCandidates(subscriptions), subscriptions),
    ).toEqual([
      { currency: 'EUR', amount: 160 },
      { currency: 'USD', amount: 60 },
    ]);
    expect(reviewCandidateAnnualCostPerCurrency([], [])).toEqual([]);
  });

  it('orders candidate amounts by first currency use among all current subscriptions', () => {
    const subscriptions: Subscription[] = [
      { ...candidate, sequence: 0, currency: 'USD', reason: 'Essential', usage: 'Daily' },
      { ...candidate, sequence: 1 },
      { ...candidate, sequence: 2, currency: 'USD', price: 5 },
    ];
    expect(
      reviewCandidateAnnualCostPerCurrency(reviewCandidates(subscriptions), subscriptions),
    ).toEqual([
      { currency: 'USD', amount: 60 },
      { currency: 'EUR', amount: 120 },
    ]);
  });
});

describe('amount joining', () => {
  it.each([
    { amounts: [], expected: '' },
    { amounts: ['€120'], expected: '€120' },
    { amounts: ['€120', '$60'], expected: '€120 and $60' },
    { amounts: ['€120', '$60', '£40'], expected: '€120, $60 and £40' },
    { amounts: ['€120', '$60', '£40', 'E£20'], expected: '€120, $60, £40 and E£20' },
  ])('joins $amounts', ({ amounts, expected }) => {
    expect(joinAmounts(amounts)).toBe(expected);
  });
});
