import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { SubscriptionField, SubscriptionControl } from '../shared/subscription-field';
import {
  BILLING_FREQUENCIES,
  BILLING_FREQUENCY_LABELS,
  CURRENCIES,
  REASONS,
  type Currency,
} from '../domain/subscription';
import { SubscriptionsState } from '../state/subscriptions-state';
import { Toast } from '../toast/toast';
import {
  createSubscriptionFormSchema,
  fieldErrorText,
  firstInvalidField,
  type ValidatedField,
  type SubscriptionFormFields,
} from '../shared/subscription-form-schema';

function createEmptyFields(preferredCurrency: Currency | null): SubscriptionFormFields {
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
  imports: [FormField, Toast, SubscriptionField, SubscriptionControl],
  templateUrl: './add-subscription-form.html',
  styleUrl: './add-subscription-form.scss',
})
export class AddSubscriptionForm {
  private readonly subscriptionsState = inject(SubscriptionsState);
  private readonly injector = inject(Injector);
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly toast = viewChild.required(Toast);

  readonly firstSubscriptionAdded = output<void>();

  readonly currencies = CURRENCIES;
  readonly billingFrequencies = BILLING_FREQUENCIES;
  readonly billingFrequencyLabels = BILLING_FREQUENCY_LABELS;
  readonly reasons = REASONS;
  readonly addModel = signal<SubscriptionFormFields>(
    createEmptyFields(this.subscriptionsState.preferredCurrency()),
  );
  readonly addForm = form(
    this.addModel,
    createSubscriptionFormSchema(this.subscriptionsState.subscriptions),
  );
  private readonly attempted = signal(false);

  constructor() {
    this.focusNameAfterRender();
  }

  add(event: Event): void {
    event.preventDefault();
    this.attempted.set(true);
    const firstInvalid = firstInvalidField(this.addForm);
    if (firstInvalid) {
      this.toast().showError(firstInvalid.message, () =>
        this.addForm[firstInvalid.field]().value(),
      );
      this.addForm[firstInvalid.field]().focusBoundControl();
      return;
    }

    const { name, price, billingFrequency, currency, reason } = this.addModel();
    // Narrow the required fields after schema validation.
    if (price === null || !billingFrequency || !currency) return;

    const isFirstSubscription = this.subscriptionsState.subscriptions().length === 0;
    this.subscriptionsState.add({
      name: name.trim(),
      price,
      billingFrequency,
      currency,
      reason,
    });
    this.toast().show('Subscription added');
    this.attempted.set(false);
    this.addForm().reset(createEmptyFields(this.subscriptionsState.preferredCurrency()));
    if (isFirstSubscription) this.firstSubscriptionAdded.emit();
    else this.focusNameAfterRender();
  }

  errorText(field: ValidatedField): string | null {
    return this.attempted() ? fieldErrorText(this.addForm, field) : null;
  }

  focusName(options?: FocusOptions): void {
    this.nameInput()?.nativeElement.focus(options);
  }

  private focusNameAfterRender(): void {
    afterNextRender(() => this.focusName(), {
      injector: this.injector,
    });
  }
}
