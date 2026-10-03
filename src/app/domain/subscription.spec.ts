import {
  annualCost,
  recurringCost,
  isRarelyUsed,
  rarelyUsedCount,
  findSubscriptionNameMatch,
  isValidName,
  isValidPrice,
  NAME_MAX_LENGTH,
  estimateUsage,
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
    expect(findSubscriptionNameMatch([netflix], ' netflix ', netflix.id)).toBeUndefined();
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
