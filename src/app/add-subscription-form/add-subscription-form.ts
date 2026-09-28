import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import {
  CURRENCIES,
  REASONS,
  type BillingFrequency,
  type Currency,
  type Reason,
} from '../domain/subscription';
import { SubscriptionsState } from '../state/subscriptions-state';

interface AddSubscriptionFields {
  name: string;
  price: number | null;
  billingFrequency: BillingFrequency | '';
  currency: Currency | '';
  reason: Reason;
}

function createEmptyFields(preferredCurrency: Currency | null): AddSubscriptionFields {
  return {
    name: '',
    price: null,
    billingFrequency: '',
    currency: preferredCurrency ?? '',
    reason: 'Essential',
  };
}

@Component({
  selector: 'app-add-subscription-form',
  imports: [FormField],
  templateUrl: './add-subscription-form.html',
  styleUrl: './add-subscription-form.scss',
})
export class AddSubscriptionForm {
  private readonly subscriptionsState = inject(SubscriptionsState);
  private readonly injector = inject(Injector);
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly currencies = CURRENCIES;
  readonly reasons = REASONS;

  readonly addModel = signal<AddSubscriptionFields>(
    createEmptyFields(this.subscriptionsState.preferredCurrency()),
  );
  readonly addForm = form(this.addModel);

  constructor() {
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
    this.addModel.set(createEmptyFields(this.subscriptionsState.preferredCurrency()));
    this.focusNameAfterRender();
  }

  private focusNameAfterRender(): void {
    afterNextRender(() => this.nameInput()?.nativeElement.focus(), { injector: this.injector });
  }
}
