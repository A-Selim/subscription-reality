import {
  annualCost,
  estimateUsage,
  formatAnnualMoney,
  formatMoney,
  monthlyCost,
  monogram,
  type Currency,
  type Reason,
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
