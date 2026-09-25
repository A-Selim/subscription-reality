import { estimateUsage, type Reason, type Usage } from './subscription';

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
