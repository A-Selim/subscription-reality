import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  viewChild,
} from '@angular/core';
import { formatAnnualMoney, formatMoney, recurringCostPerCurrency } from '../domain/subscription';
import { scrollIntoView } from '../shared/scroll-into-view';
import { SubscriptionsState } from '../state/subscriptions-state';

@Component({
  selector: 'app-reality',
  templateUrl: './reality.html',
  styleUrl: './reality.scss',
})
export class Reality {
  private readonly subscriptions = inject(SubscriptionsState).subscriptions;
  private readonly injector = inject(Injector);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  readonly isLive = computed(() => this.subscriptions().length > 0);
  readonly cards = computed(() => {
    const costs = recurringCostPerCurrency(this.subscriptions());
    if (costs.length === 0) {
      return [
        {
          currency: null,
          label: null,
          annual: '0',
          annualAfterCancel: '0',
          monthly: '0',
          subscriptionCount: 0,
          rarelyUsedCount: 0,
        },
      ];
    }
    return costs.map((cost) => ({
      ...cost,
      label: `Subscription reality in ${cost.currency}`,
      annual: formatAnnualMoney(cost.annual, cost.currency),
      annualAfterCancel: formatAnnualMoney(cost.annualAfterCancel, cost.currency),
      monthly: formatMoney(cost.monthly, cost.currency),
    }));
  });

  showReality(): void {
    afterNextRender(
      () => {
        scrollIntoView(this.section().nativeElement);
        this.heading().nativeElement.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }
}
