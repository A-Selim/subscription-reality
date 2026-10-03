import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
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
  private readonly injector = inject(Injector);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly addSubscriptionForm = viewChild(AddSubscriptionForm);

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

  startAdding(): void {
    this.revealForm();
    this.section().nativeElement.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
    afterNextRender(() => this.addSubscriptionForm()?.focusName({ preventScroll: true }), {
      injector: this.injector,
    });
  }
}
