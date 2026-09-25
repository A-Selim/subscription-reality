import { computed, signal, Service } from '@angular/core';
import { estimateUsage, type AppState, type Subscription } from '../domain/subscription';

export type NewSubscription = Pick<
  Subscription,
  'name' | 'price' | 'billingFrequency' | 'currency' | 'reason'
>;

@Service()
export class SubscriptionsState {
  private readonly state = signal<AppState>({
    version: 1,
    subscriptions: [],
    preferredCurrency: null,
    nextSequence: 0,
  });

  readonly subscriptions = computed(() => this.state().subscriptions);
  readonly preferredCurrency = computed(() => this.state().preferredCurrency);

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
  }
}
