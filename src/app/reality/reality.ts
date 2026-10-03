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
  formatAnnualMoney,
  formatMoney,
  rarelyUsedCount,
  recurringCost,
} from '../domain/subscription';
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
  readonly card = computed(() => {
    const subscriptions = this.subscriptions();
    const currency = subscriptions[0]?.currency;
    if (!currency) {
      return { annual: '0', monthly: '0', subscriptionCount: 0, rarelyUsedCount: 0 };
    }
    const cost = recurringCost(subscriptions);
    return {
      annual: formatAnnualMoney(cost.annual, currency),
      monthly: formatMoney(cost.monthly, currency),
      subscriptionCount: subscriptions.length,
      rarelyUsedCount: rarelyUsedCount(subscriptions),
    };
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
