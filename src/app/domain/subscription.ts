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
