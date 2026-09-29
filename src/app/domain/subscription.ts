export const CURRENCIES = ['EUR', 'USD', 'GBP', 'EGP'] as const;
export type Currency = (typeof CURRENCIES)[number];
export type BillingFrequency = 'monthly' | 'yearly';
export const REASONS = [
  'Essential',
  'High Value',
  'Convenience',
  'Nice to Have',
  'Occasional Use',
  'Work / Learning',
] as const;
export type Reason = (typeof REASONS)[number];
export type Usage = 'Daily' | 'Weekly' | 'Monthly' | 'Rarely' | 'Almost Never';
export type ReviewDecision = 'keep' | 'unsure' | 'cancel';

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
