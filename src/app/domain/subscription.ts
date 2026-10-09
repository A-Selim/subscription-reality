export const CURRENCIES = ['EUR', 'USD', 'GBP', 'EGP'] as const;
export type Currency = (typeof CURRENCIES)[number];
export const BILLING_FREQUENCIES = ['monthly', 'yearly'] as const;
export type BillingFrequency = (typeof BILLING_FREQUENCIES)[number];
export const BILLING_FREQUENCY_LABELS: Record<BillingFrequency, string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
};
export const REASONS = [
  'Essential',
  'High Value',
  'Convenience',
  'Nice to Have',
  'Occasional Use',
  'Work / Learning',
] as const;
export type Reason = (typeof REASONS)[number];
export const REVIEW_CANDIDATE_REASONS: readonly Reason[] = [
  'Nice to Have',
  'Convenience',
  'Occasional Use',
];
export const USAGES = ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Almost Never'] as const;
export type Usage = (typeof USAGES)[number];
export const REVIEW_DECISIONS = ['keep', 'unsure', 'cancel'] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];
export const REVIEW_DECISION_LABELS: Record<ReviewDecision, string> = {
  keep: 'Keep',
  unsure: 'Unsure',
  cancel: 'Cancel',
};

export type CurrencyAmount = { currency: Currency; amount: number };

export interface Subscription {
  id: string;
  sequence: number;
  name: string;
  price: number;
  billingFrequency: BillingFrequency;
  currency: Currency;
  reason: Reason;
  usage: Usage;
  usageConfirmed: boolean;
  decision: ReviewDecision | null;
}

export interface AppState {
  version: 1;
  subscriptions: Subscription[];
  preferredCurrency: Currency | null;
  nextSequence: number;
}

export function monogram(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function billingUnitLabel(frequency: BillingFrequency): string {
  return frequency === 'monthly' ? 'month' : 'year';
}

type CostInput = Pick<Subscription, 'price' | 'billingFrequency'>;
type CurrencyCostInput = CostInput & Pick<Subscription, 'currency'>;

export function monthlyCost(subscription: CostInput): number {
  return subscription.billingFrequency === 'monthly' ? subscription.price : subscription.price / 12;
}

export function annualCost(subscription: CostInput): number {
  return subscription.billingFrequency === 'monthly' ? subscription.price * 12 : subscription.price;
}

const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  EGP: 'E£',
};

function formatAmount(amount: number, currency: Currency, decimals: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${currencySymbols[currency]}${formatted}`;
}

export function formatMoney(amount: number, currency: Currency): string {
  return formatAmount(amount, currency, 2);
}

export function formatAnnualMoney(amount: number, currency: Currency): string {
  return formatAmount(amount, currency, amount !== 0 && Math.abs(amount) < 0.5 ? 2 : 0);
}

export function otherUnitCostText(subscription: CurrencyCostInput): string {
  return subscription.billingFrequency === 'monthly'
    ? `${formatAnnualMoney(annualCost(subscription), subscription.currency)} / year`
    : `${formatMoney(monthlyCost(subscription), subscription.currency)} / month`;
}

export function estimateUsage(reason: Reason): Usage {
  switch (reason) {
    case 'Essential':
    case 'High Value':
    case 'Work / Learning':
      return 'Daily';
    case 'Convenience':
      return 'Weekly';
    case 'Nice to Have':
      return 'Monthly';
    case 'Occasional Use':
      return 'Rarely';
  }
}

export function usageAfterReasonEdit(
  subscription: Pick<Subscription, 'reason' | 'usage' | 'usageConfirmed'>,
  reason: Reason,
): Usage {
  return !subscription.usageConfirmed && reason !== subscription.reason
    ? estimateUsage(reason)
    : subscription.usage;
}

export const NAME_MAX_LENGTH = 40;

export function isValidName(name: string): boolean {
  const trimmedName = name.trim();
  return trimmedName.length > 0 && trimmedName.length <= NAME_MAX_LENGTH;
}

export function normalizeSubscriptionName(name: string): string {
  return name.trim().toLowerCase();
}

export function findSubscriptionNameMatch(
  subscriptions: readonly Subscription[],
  candidateName: string,
  excludedId?: string,
): Subscription | undefined {
  const normalizedCandidateName = normalizeSubscriptionName(candidateName);

  return subscriptions.find(
    (subscription) =>
      subscription.id !== excludedId &&
      normalizeSubscriptionName(subscription.name) === normalizedCandidateName,
  );
}

export function isValidPrice(price: number): boolean {
  // Compare in price units: multiplying by 100 introduces rounding errors for 1.1 and 0.07.
  return Number.isFinite(price) && price > 0 && price === Number(price.toFixed(2));
}

export function recurringCost(subscriptions: readonly CostInput[]): {
  annual: number;
  monthly: number;
} {
  return subscriptions.reduce(
    (cost, subscription) => ({
      annual: cost.annual + annualCost(subscription),
      monthly: cost.monthly + monthlyCost(subscription),
    }),
    { annual: 0, monthly: 0 },
  );
}

export function isRarelyUsed(subscription: Pick<Subscription, 'usage'>): boolean {
  return subscription.usage === 'Rarely' || subscription.usage === 'Almost Never';
}

export function rarelyUsedCount(subscriptions: readonly Pick<Subscription, 'usage'>[]): number {
  return subscriptions.filter(isRarelyUsed).length;
}

function groupSubscriptionsPerCurrency(subscriptions: readonly Subscription[]) {
  const groups = new Map<Currency, Subscription[]>();
  for (const subscription of [...subscriptions].sort((a, b) => a.sequence - b.sequence)) {
    const group = groups.get(subscription.currency);
    if (group) {
      group.push(subscription);
    } else {
      groups.set(subscription.currency, [subscription]);
    }
  }

  return groups;
}

export function potentialSavings(
  subscriptions: readonly Pick<Subscription, 'price' | 'billingFrequency' | 'decision'>[],
): number {
  return subscriptions.reduce(
    (amount, subscription) =>
      amount + (subscription.decision === 'cancel' ? annualCost(subscription) : 0),
    0,
  );
}

export function recurringCostPerCurrency(subscriptions: readonly Subscription[]) {
  return Array.from(groupSubscriptionsPerCurrency(subscriptions), ([currency, group]) => {
    const cost = recurringCost(group);

    return {
      currency,
      ...cost,
      subscriptionCount: group.length,
      rarelyUsedCount: rarelyUsedCount(group),
      annualAfterCancel: cost.annual - potentialSavings(group),
    };
  });
}

export function reviewQueue(subscriptions: readonly Subscription[]): Subscription[] {
  return subscriptions
    .filter((subscription) => subscription.decision === null)
    .sort((a, b) => a.sequence - b.sequence);
}

export function nextInReviewAgainPass(
  subscriptions: readonly Subscription[],
  afterSequence: number,
): Subscription | undefined {
  return subscriptions
    .filter((subscription) => subscription.sequence > afterSequence)
    .sort((a, b) => a.sequence - b.sequence)[0];
}

export function potentialSavingsPerCurrency(
  subscriptions: readonly Subscription[],
): CurrencyAmount[] {
  return Array.from(groupSubscriptionsPerCurrency(subscriptions), ([currency, group]) => ({
    currency,
    amount: potentialSavings(group),
  }));
}

export function decisionCounts(
  subscriptions: readonly Subscription[],
): Record<ReviewDecision, number> {
  return subscriptions.reduce(
    (counts, subscription) => {
      if (subscription.decision !== null) counts[subscription.decision] += 1;
      return counts;
    },
    Object.fromEntries(REVIEW_DECISIONS.map((decision) => [decision, 0])) as Record<
      ReviewDecision,
      number
    >,
  );
}

export function isReviewCandidate(subscription: Pick<Subscription, 'reason' | 'usage'>): boolean {
  return REVIEW_CANDIDATE_REASONS.includes(subscription.reason) && isRarelyUsed(subscription);
}

export function reviewCandidates(subscriptions: readonly Subscription[]): Subscription[] {
  return subscriptions.filter(isReviewCandidate).sort((a, b) => a.sequence - b.sequence);
}

export function reviewCandidateAnnualCostPerCurrency(
  candidates: readonly Subscription[],
  subscriptions: readonly Subscription[],
): CurrencyAmount[] {
  const candidateGroups = groupSubscriptionsPerCurrency(candidates);
  return Array.from(groupSubscriptionsPerCurrency(subscriptions).keys()).flatMap((currency) => {
    const group = candidateGroups.get(currency);
    return group ? [{ currency, amount: recurringCost(group).annual }] : [];
  });
}

export function joinAmounts(amounts: readonly string[]): string {
  if (amounts.length < 2) return amounts.join('');
  return `${amounts.slice(0, -1).join(', ')} and ${amounts[amounts.length - 1]}`;
}
