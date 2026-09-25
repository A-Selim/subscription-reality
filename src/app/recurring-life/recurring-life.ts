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
import { FormField, form } from '@angular/forms/signals';
import { type BillingFrequency, type Currency, type Reason } from '../domain/subscription';
import { SubscriptionsState } from '../state/subscriptions-state';

interface AddSubscriptionFields {
  name: string;
  price: number | null;
  billingFrequency: BillingFrequency | '';
  currency: Currency | '';
  reason: Reason;
}

@Component({
  selector: 'app-recurring-life',
  imports: [FormField],
  templateUrl: './recurring-life.html',
  styleUrl: './recurring-life.scss',
})
export class RecurringLife {
  private readonly subscriptionsState = inject(SubscriptionsState);
  private readonly injector = inject(Injector);
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly subscriptions = this.subscriptionsState.subscriptions;
  readonly showForm = signal(false);
  readonly hasSubscriptions = computed(() => this.subscriptions().length > 0);
  readonly currencies: readonly Currency[] = ['EUR', 'USD', 'GBP', 'EGP'];
  readonly reasons: readonly Reason[] = [
    'Essential',
    'High Value',
    'Convenience',
    'Nice to Have',
    'Occasional Use',
    'Work / Learning',
  ];

  readonly addModel = signal<AddSubscriptionFields>({
    name: '',
    price: null,
    billingFrequency: '',
    currency: this.subscriptionsState.preferredCurrency() ?? '',
    reason: 'Essential',
  });
  readonly addForm = form(this.addModel);

  revealForm(): void {
    this.showForm.set(true);
    this.focusNameAfterRender();
  }

  add(event: Event): void {
    event.preventDefault();
    const { name, price, billingFrequency, currency, reason } = this.addModel();
    const trimmedName = name.trim();

    if (
      !trimmedName ||
      typeof price !== 'number' ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !billingFrequency ||
      !currency
    ) {
      return;
    }

    this.subscriptionsState.add({
      name: trimmedName,
      price,
      billingFrequency,
      currency,
      reason,
    });
    this.addModel.set({
      name: '',
      price: null,
      billingFrequency: '',
      currency: this.subscriptionsState.preferredCurrency() ?? '',
      reason: 'Essential',
    });
    this.focusNameAfterRender();
  }

  private focusNameAfterRender(): void {
    afterNextRender(() => this.nameInput()?.nativeElement.focus(), { injector: this.injector });
  }
}
