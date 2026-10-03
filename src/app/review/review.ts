import { Component, computed, inject } from '@angular/core';

import {
  annualCost,
  monthlyCost,
  formatAnnualMoney,
  formatMoney,
  monogram,
  REASONS,
  USAGES,
  type Reason,
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
      usage: subscription.usage,
      annualCostText: formatAnnualMoney(annualCost(subscription), subscription.currency),
      monthlyCostText: formatMoney(monthlyCost(subscription), subscription.currency),
    };
  });

  protected setReason(reason: Reason): void {
    const subscription = this.currentReview();
    if (subscription) this.state.setReason(subscription.id, reason);
  }

  protected setUsage(usage: Usage): void {
    const subscription = this.currentReview();
    if (subscription) this.state.setUsage(subscription.id, usage);
  }
}
