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
  viewChildren,
} from '@angular/core';
import { AddSubscriptionForm } from '../add-subscription-form/add-subscription-form';
import { CardDialog } from '../card-dialog/card-dialog';
import { type Subscription } from '../domain/subscription';
import { SubscriptionCard } from '../subscription-card/subscription-card';
import { scrollIntoView } from '../shared/scroll-into-view';
import { SubscriptionsState } from '../state/subscriptions-state';

@Component({
  selector: 'app-recurring-life',
  imports: [AddSubscriptionForm, SubscriptionCard, CardDialog],
  templateUrl: './recurring-life.html',
  styleUrl: './recurring-life.scss',
})
export class RecurringLife {
  private readonly subscriptionsState = inject(SubscriptionsState);
  private readonly injector = inject(Injector);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly addSubscriptionForm = viewChild(AddSubscriptionForm);

  private readonly dialog = viewChild.required(CardDialog);
  private readonly cards = viewChildren(SubscriptionCard);
  private dialogTrigger: SubscriptionCard | null = null;
  private deleteOnClose = false;
  readonly dialogSubscription = signal<Subscription | null>(null);

  readonly firstSubscriptionAdded = output<void>();
  readonly subscriptions = this.subscriptionsState.subscriptions;
  readonly showForm = signal(false);
  readonly hasSubscriptions = computed(() => this.subscriptions().length > 0);
  readonly editingId = signal<string | null>(null);

  openDelete(subscription: Subscription, trigger: SubscriptionCard): void {
    this.dialogTrigger = trigger;
    this.dialogSubscription.set(subscription);
    afterNextRender(() => this.dialog().open(), { injector: this.injector });
  }

  closeDialog(): void {
    const shouldDelete = this.deleteOnClose;
    this.deleteOnClose = false;
    if (shouldDelete) {
      this.deleteSubscription();
    } else {
      this.dialogSubscription.set(null);
      this.dialogTrigger?.focusDeleteButton();
      this.dialogTrigger = null;
    }
  }

  dismissDialog(): void {
    this.dialog().dismiss();
  }

  confirmDelete(): void {
    this.deleteOnClose = true;
    this.dialog().dismiss();
  }

  keepAsCancel(): void {
    const subscription = this.dialogSubscription();
    if (!subscription) return;
    this.subscriptionsState.keepAsCancel(subscription.id);
    this.dialog().dismiss();
  }

  private deleteSubscription(): void {
    const subscription = this.dialogSubscription();
    if (!subscription) return;
    const subscriptions = this.subscriptions();
    const index = subscriptions.findIndex(({ id }) => id === subscription.id);
    const neighbour = subscriptions[index + 1] ?? subscriptions[index - 1];
    this.dialogSubscription.set(null);
    this.dialogTrigger = null;
    this.subscriptionsState.delete(subscription.id);
    if (this.editingId() === subscription.id) this.editingId.set(null);
    if (!neighbour) {
      this.startAdding();
    } else {
      afterNextRender(
        () =>
          this.cards()
            .find((card) => card.subscription().id === neighbour.id)
            ?.focusCard(),
        { injector: this.injector },
      );
    }
  }

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
