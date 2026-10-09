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
import { EditSubscriptionForm } from '../edit-subscription-form/edit-subscription-form';
import { CardDialog } from '../card-dialog/card-dialog';
import { type Subscription } from '../domain/subscription';
import { SubscriptionCard } from '../subscription-card/subscription-card';
import { scrollIntoView } from '../shared/scroll-into-view';
import { SubscriptionsState } from '../state/subscriptions-state';

@Component({
  selector: 'app-recurring-life',
  imports: [AddSubscriptionForm, SubscriptionCard, CardDialog, EditSubscriptionForm],
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
  readonly dialogMode = signal<'edit' | 'delete'>('delete');
  private readonly editForm = viewChild(EditSubscriptionForm);
  readonly dialogConfig = computed(() =>
    this.dialogMode() === 'edit'
      ? {
          titleId: 'edit-title',
          descriptionId: 'edit-hint',
          returnFocus: (card: SubscriptionCard) => card.focusCard(),
        }
      : {
          titleId: 'delete-question',
          descriptionId: 'delete-description',
          returnFocus: (card: SubscriptionCard) => card.focusDeleteButton(),
        },
  );
  readonly savedDialogSubscription = computed(() => {
    const opened = this.dialogSubscription();
    return this.subscriptions().find(({ id }) => id === opened?.id) ?? null;
  });

  openEdit(subscription: Subscription, trigger: SubscriptionCard): void {
    this.openDialog('edit', subscription, trigger);
  }

  openDelete(subscription: Subscription, trigger: SubscriptionCard): void {
    this.openDialog('delete', subscription, trigger);
  }

  private openDialog(
    mode: 'edit' | 'delete',
    subscription: Subscription,
    trigger: SubscriptionCard,
  ): void {
    if (this.dialogSubscription()) return;
    this.deleteOnClose = false;
    this.dialogMode.set(mode);
    this.dialogTrigger = trigger;
    this.dialogSubscription.set(subscription);
    afterNextRender(
      () => {
        this.dialog().open();
        this.editForm()?.focusName();
      },
      { injector: this.injector },
    );
  }

  closeDialog(): void {
    const shouldDelete = this.deleteOnClose;
    this.deleteOnClose = false;
    if (shouldDelete) {
      this.deleteSubscription();
    } else {
      this.dialogSubscription.set(null);
      if (this.dialogTrigger) this.dialogConfig().returnFocus(this.dialogTrigger);
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
