import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  viewChild,
} from '@angular/core';

import {
  annualCost,
  monthlyCost,
  formatAnnualMoney,
  formatMoney,
  monogram,
  REASONS,
  REVIEW_DECISIONS,
  REVIEW_DECISION_LABELS,
  USAGES,
  type Reason,
  type ReviewDecision,
  type Usage,
} from '../domain/subscription';
import { SubscriptionsState } from '../state/subscriptions-state';

@Component({
  selector: 'app-review',
  templateUrl: './review.html',
  styleUrl: './review.scss',
})
export class Review {
  private readonly state = inject(SubscriptionsState);
  private readonly injector = inject(Injector);
  private readonly reviewHeading = viewChild<ElementRef<HTMLHeadingElement>>('reviewHeading');
  protected readonly subscriptionCount = this.state.subscriptionCount;
  protected readonly decidedCount = this.state.decidedCount;
  protected readonly reviewProgress = computed(() =>
    this.subscriptionCount() === 0 ? 0 : (this.decidedCount() / this.subscriptionCount()) * 100,
  );
  protected readonly progressLabel = computed(
    () => `${this.decidedCount()} of ${this.subscriptionCount()} reviewed`,
  );
  protected readonly decisions = REVIEW_DECISIONS;
  protected readonly decisionLabels = REVIEW_DECISION_LABELS;
  protected readonly reasons = REASONS;
  protected readonly usages = USAGES;
  protected readonly hasSubscriptions = this.state.hasSubscriptions;
  protected readonly currentReview = computed(() => {
    const subscription = this.state.currentReviewSubscription();
    if (!subscription) return undefined;

    return {
      id: subscription.id,
      name: subscription.name,
      monogram: monogram(subscription.name),
      reason: subscription.reason,
      decision: subscription.decision,
      usage: subscription.usage,
      annualCostText: formatAnnualMoney(annualCost(subscription), subscription.currency),
      monthlyCostText: formatMoney(monthlyCost(subscription), subscription.currency),
    };
  });

  protected decide(decision: ReviewDecision): void {
    const subscription = this.currentReview();
    if (!subscription) return;

    this.state.decide(subscription.id, decision);
    afterNextRender(() => this.reviewHeading()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  protected reviewAgain(): void {
    this.state.reviewAgain();
    afterNextRender(() => this.reviewHeading()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  protected setReason(reason: Reason): void {
    const subscription = this.currentReview();
    if (subscription) this.state.setReason(subscription.id, reason);
  }

  protected setUsage(usage: Usage): void {
    const subscription = this.currentReview();
    if (subscription) this.state.setUsage(subscription.id, usage);
  }
}
