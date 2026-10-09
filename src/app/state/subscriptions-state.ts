import { computed, inject, signal, Service } from '@angular/core';
import {
  estimateUsage,
  usageAfterReasonEdit,
  reviewQueue,
  nextInReviewAgainPass,
  type AppState,
  type Subscription,
  type Reason,
  type ReviewDecision,
  type Usage,
} from '../domain/subscription';
import { AppStorage, UnreadableStateError } from './app-storage';

export type SubscriptionDetails = Pick<
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
  private readonly reviewAgainAfterSequence = signal<number | null>(null);
  private readonly selectedReviewIdState = signal<string | null>(null, { equal: () => false });
  private readonly loadedState = signal(false);
  private readonly dataUnreadableState = signal(false);
  private readonly onlyForThisVisitState = signal(false);
  private pendingSave: AppState | null = null;
  private saving = false;

  readonly selectedReviewId = this.selectedReviewIdState.asReadonly();
  readonly loaded = this.loadedState.asReadonly();
  readonly dataUnreadable = this.dataUnreadableState.asReadonly();
  readonly onlyForThisVisit = this.onlyForThisVisitState.asReadonly();

  readonly subscriptions = computed(() => this.state().subscriptions);
  readonly hasSubscriptions = computed(() => this.subscriptions().length > 0);
  readonly currentReviewSubscription = computed(() => {
    const subscriptions = this.subscriptions();
    const selectedId = this.selectedReviewIdState();
    const selected = subscriptions.find(({ id }) => id === selectedId);
    if (selected) return selected;

    const afterSequence = this.reviewAgainAfterSequence();
    return (
      (afterSequence === null ? undefined : nextInReviewAgainPass(subscriptions, afterSequence)) ??
      reviewQueue(subscriptions)[0]
    );
  });
  readonly subscriptionCount = computed(() => this.subscriptions().length);
  readonly decidedCount = computed(
    () => this.subscriptions().filter((subscription) => subscription.decision !== null).length,
  );
  readonly preferredCurrency = computed(() => this.state().preferredCurrency);

  constructor() {
    void this.load();
  }

  add(input: SubscriptionDetails): void {
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

  edit(id: string, fields: Partial<SubscriptionDetails>): void {
    const subscription = this.subscriptions().find((subscription) => subscription.id === id);
    if (!subscription) return;

    this.updateSubscription(id, {
      ...fields,
      usage: usageAfterReasonEdit(subscription, fields.reason ?? subscription.reason),
    });
  }

  setReason(id: string, reason: Reason): void {
    this.updateSubscription(id, { reason });
  }

  delete(id: string): void {
    if (!this.subscriptions().some((subscription) => subscription.id === id)) return;
    if (this.selectedReviewIdState() === id) this.selectedReviewIdState.set(null);
    this.state.update((current) => ({
      ...current,
      subscriptions: current.subscriptions.filter((subscription) => subscription.id !== id),
    }));
    const afterSequence = this.reviewAgainAfterSequence();
    if (afterSequence !== null && !nextInReviewAgainPass(this.subscriptions(), afterSequence)) {
      this.reviewAgainAfterSequence.set(null);
    }
    this.persist();
  }

  setUsage(id: string, usage: Usage): void {
    this.updateSubscription(id, { usage });
  }

  bringUpForReview(id: string): void {
    if (this.subscriptions().some((subscription) => subscription.id === id)) {
      this.selectedReviewIdState.set(id);
    }
  }

  reviewAgain(): void {
    this.reviewAgainAfterSequence.set(-1);
  }

  decide(id: string, decision: ReviewDecision): void {
    const subscription = this.subscriptions().find((subscription) => subscription.id === id);
    if (!subscription) return;

    const selected = this.selectedReviewIdState() === id;
    const afterSequence = this.reviewAgainAfterSequence();
    const advancePass =
      afterSequence !== null &&
      nextInReviewAgainPass(this.subscriptions(), afterSequence)?.id === id;
    this.updateSubscription(id, { decision, usageConfirmed: true });
    if (selected) this.selectedReviewIdState.set(null);
    if (advancePass) {
      this.reviewAgainAfterSequence.set(
        nextInReviewAgainPass(this.subscriptions(), subscription.sequence)
          ? subscription.sequence
          : null,
      );
    }
  }

  private updateSubscription(
    id: string,
    changes: Partial<
      SubscriptionDetails & Pick<Subscription, 'usage' | 'decision' | 'usageConfirmed'>
    >,
  ): void {
    this.state.update((current) => ({
      ...current,
      subscriptions: current.subscriptions.map((subscription) =>
        subscription.id === id ? { ...subscription, ...changes } : subscription,
      ),
    }));
    this.persist();
  }

  private async load(): Promise<void> {
    try {
      const saved = await this.storage.load();
      if (saved !== null) this.state.set(saved);
    } catch (error) {
      if (error instanceof UnreadableStateError) this.dataUnreadableState.set(true);
      else this.onlyForThisVisitState.set(true);
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
        this.onlyForThisVisitState.set(false);
      } catch (error) {
        this.onlyForThisVisitState.set(true);
        console.warn('Could not save subscriptions.', error);
      }
    }
    this.saving = false;
  }
}
