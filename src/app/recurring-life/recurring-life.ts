import { Component, computed, inject, signal } from '@angular/core';
import { AddSubscriptionForm } from '../add-subscription-form/add-subscription-form';
import {
  annualCost,
  billingUnitLabel,
  formatAnnualMoney,
  formatMoney,
  monogram,
  type Subscription,
} from '../domain/subscription';
import { SubscriptionsState } from '../state/subscriptions-state';

@Component({
  selector: 'app-recurring-life',
  imports: [AddSubscriptionForm],
  templateUrl: './recurring-life.html',
  styleUrl: './recurring-life.scss',
})
export class RecurringLife {
  private readonly subscriptionsState = inject(SubscriptionsState);

  readonly subscriptions = this.subscriptionsState.subscriptions;
  readonly showForm = signal(false);
  readonly hasSubscriptions = computed(() => this.subscriptions().length > 0);
  readonly monogram = monogram;
  readonly billingUnitLabel = billingUnitLabel;

  priceText(subscription: Subscription): string {
    return formatMoney(subscription.price, subscription.currency);
  }

  annualCostText(subscription: Subscription): string {
    return formatAnnualMoney(annualCost(subscription), subscription.currency);
  }

  revealForm(): void {
    this.showForm.set(true);
  }
}
