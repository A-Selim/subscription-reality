import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AddSubscriptionForm } from '../add-subscription-form/add-subscription-form';
import { SubscriptionCard } from '../subscription-card/subscription-card';
import { scrollIntoView } from '../shared/scroll-into-view';
import { SubscriptionsState } from '../state/subscriptions-state';

@Component({
  selector: 'app-recurring-life',
  imports: [AddSubscriptionForm, SubscriptionCard],
  templateUrl: './recurring-life.html',
  styleUrl: './recurring-life.scss',
})
export class RecurringLife {
  private readonly subscriptionsState = inject(SubscriptionsState);
  private readonly injector = inject(Injector);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly addSubscriptionForm = viewChild(AddSubscriptionForm);

  readonly firstSubscriptionAdded = output<void>();
  readonly subscriptions = this.subscriptionsState.subscriptions;
  readonly showForm = signal(false);
  readonly hasSubscriptions = computed(() => this.subscriptions().length > 0);
  readonly editingId = signal<string | null>(null);

  revealForm(): void {
    this.showForm.set(true);
  }

  startAdding(): void {
    this.revealForm();
    scrollIntoView(this.section().nativeElement);
    afterNextRender(() => this.addSubscriptionForm()?.focusName({ preventScroll: true }), {
      injector: this.injector,
    });
  }
}
