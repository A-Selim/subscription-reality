import {
  BILLING_FREQUENCIES,
  CURRENCIES,
  isValidName,
  isValidPrice,
  REASONS,
  REVIEW_DECISIONS,
  USAGES,
  type AppState,
} from '../domain/subscription';

function isOneOf<T extends string>(value: unknown, choices: readonly T[]): value is T {
  return typeof value === 'string' && choices.some((choice) => choice === value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function isAppState(value: unknown): value is AppState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Record<string, unknown>;
  if (
    state['version'] !== 1 ||
    !Array.isArray(state['subscriptions']) ||
    !(state['preferredCurrency'] === null || isOneOf(state['preferredCurrency'], CURRENCIES)) ||
    !isNonNegativeInteger(state['nextSequence'])
  )
    return false;

  return state['subscriptions'].every((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null) return false;
    const subscription = entry as Record<string, unknown>;
    return (
      typeof subscription['id'] === 'string' &&
      typeof subscription['name'] === 'string' &&
      isValidName(subscription['name']) &&
      isNonNegativeInteger(subscription['sequence']) &&
      typeof subscription['price'] === 'number' &&
      isValidPrice(subscription['price']) &&
      isOneOf(subscription['billingFrequency'], BILLING_FREQUENCIES) &&
      isOneOf(subscription['currency'], CURRENCIES) &&
      isOneOf(subscription['reason'], REASONS) &&
      isOneOf(subscription['usage'], USAGES) &&
      typeof subscription['usageConfirmed'] === 'boolean' &&
      (subscription['decision'] === null || isOneOf(subscription['decision'], REVIEW_DECISIONS))
    );
  });
}
