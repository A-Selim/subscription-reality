import { computed, inject, signal, Service } from '@angular/core';
import { estimateUsage, type AppState, type Subscription } from '../domain/subscription';
import { AppStorage } from './app-storage';

export type NewSubscription = Pick<
  Subscription,
  'name' | 'price' | 'billingFrequency' | 'currency' | 'reason'
>;

@Service()
export class SubscriptionsState {
  private readonly storage = inject(AppStorage);
  private readonly state = signal<AppState>({
    version: 1,
    subscriptions: [],
    preferredCurrency: null,
    nextSequence: 0,
  });
  private readonly loadedState = signal(false);
  private pendingSave: AppState | null = null;
  private saving = false;

  readonly loaded = this.loadedState.asReadonly();

  readonly subscriptions = computed(() => this.state().subscriptions);
  readonly preferredCurrency = computed(() => this.state().preferredCurrency);

  constructor() {
    void this.load();
  }

  add(input: NewSubscription): void {
    this.state.update((current) => ({
      ...current,
      subscriptions: [
        ...current.subscriptions,
        {
          ...input,
          id: crypto.randomUUID(),
          sequence: current.nextSequence,
          usage: estimateUsage(input.reason),
          usageConfirmed: false,
          decision: null,
        },
      ],
      preferredCurrency: input.currency,
      nextSequence: current.nextSequence + 1,
    }));
    this.persist();
  }

  private async load(): Promise<void> {
    try {
      const saved = await this.storage.load();
      if (saved !== null) this.state.set(saved);
    } catch (error) {
      console.warn('Could not load subscriptions.', error);
    } finally {
      this.loadedState.set(true);
    }
  }

  private persist(): void {
    this.pendingSave = this.state();
    if (!this.saving) void this.drainSaves();
  }

  private async drainSaves(): Promise<void> {
    this.saving = true;
    while (this.pendingSave !== null) {
      const next = this.pendingSave;
      this.pendingSave = null;
      try {
        await this.storage.save(next);
      } catch (error) {
        console.warn('Could not save subscriptions.', error);
      }
    }
    this.saving = false;
  }
}
