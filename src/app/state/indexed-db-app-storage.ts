import { Service } from '@angular/core';
import {
  BILLING_FREQUENCIES,
  CURRENCIES,
  REASONS,
  REVIEW_DECISIONS,
  USAGES,
  type AppState,
} from '../domain/subscription';
import { AppStorage } from './app-storage';

const DATABASE = 'subscription-reality';
const STORE = 'app-state';
const KEY = 'current';

function isOneOf<T extends string>(value: unknown, choices: readonly T[]): value is T {
  return typeof value === 'string' && choices.some((choice) => choice === value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isAppState(value: unknown): value is AppState {
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
      isNonNegativeInteger(subscription['sequence']) &&
      typeof subscription['price'] === 'number' &&
      Number.isFinite(subscription['price']) &&
      subscription['price'] > 0 &&
      isOneOf(subscription['billingFrequency'], BILLING_FREQUENCIES) &&
      isOneOf(subscription['currency'], CURRENCIES) &&
      isOneOf(subscription['reason'], REASONS) &&
      isOneOf(subscription['usage'], USAGES) &&
      typeof subscription['usageConfirmed'] === 'boolean' &&
      (subscription['decision'] === null || isOneOf(subscription['decision'], REVIEW_DECISIONS))
    );
  });
}

@Service()
export class IndexedDbAppStorage extends AppStorage {
  private readonly database = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  async load(): Promise<AppState | null> {
    try {
      const database = await this.database;
      const value = await new Promise<unknown>((resolve, reject) => {
        const request = database.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return isAppState(value) ? value : null;
    } catch {
      return null;
    }
  }

  async save(state: AppState): Promise<void> {
    const database = await this.database;
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).put(state, KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }
}
