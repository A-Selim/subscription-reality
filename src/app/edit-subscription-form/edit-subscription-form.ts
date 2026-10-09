import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { SubscriptionField, SubscriptionControl } from '../shared/subscription-field';
import {
  createSubscriptionFormSchema,
  fieldErrorText,
  firstInvalidField,
  type ValidatedField,
  type SubscriptionFormFields,
} from '../shared/subscription-form-schema';
import {
  annualCost,
  BILLING_FREQUENCIES,
  BILLING_FREQUENCY_LABELS,
  CURRENCIES,
  formatAnnualMoney,
  REASONS,
  type Subscription,
} from '../domain/subscription';
import { Toast } from '../toast/toast';
import { type SubscriptionDetails, SubscriptionsState } from '../state/subscriptions-state';

function changedEditFields(
  previous: SubscriptionDetails,
  current: SubscriptionDetails,
): Partial<SubscriptionDetails> {
  const changes: Partial<SubscriptionDetails> = {};
  if (current.name !== previous.name) changes.name = current.name;
  if (current.price !== previous.price) changes.price = current.price;
  if (current.billingFrequency !== previous.billingFrequency)
    changes.billingFrequency = current.billingFrequency;
  if (current.currency !== previous.currency) changes.currency = current.currency;
  if (current.reason !== previous.reason) changes.reason = current.reason;
  return changes;
}

@Component({
  selector: 'app-edit-subscription-form',
  imports: [FormField, Toast, SubscriptionField, SubscriptionControl],
  templateUrl: './edit-subscription-form.html',
  styleUrl: './edit-subscription-form.scss',
})
export class EditSubscriptionForm {
  private readonly state = inject(SubscriptionsState);
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly toast = viewChild(Toast);

  readonly subscription = input.required<Subscription>();

  readonly closed = output<void>();

  readonly currencies = CURRENCIES;
  readonly billingFrequencies = BILLING_FREQUENCIES;
  readonly billingFrequencyLabels = BILLING_FREQUENCY_LABELS;
  readonly reasons = REASONS;
  readonly annualCostText = computed(() => {
    const saved =
      this.state.subscriptions().find(({ id }) => id === this.subscription().id) ??
      this.subscription();
    const draft = this.validDraft();
    const preview = draft ?? saved;
    return formatAnnualMoney(annualCost(preview), preview.currency);
  });
  private readonly editModel = signal<SubscriptionFormFields>({
    name: '',
    price: null,
    billingFrequency: '',
    currency: '',
    reason: 'Essential',
  });
  readonly editForm = form(
    this.editModel,
    createSubscriptionFormSchema(this.state.subscriptions, () => this.subscription().id),
  );

  private readonly validDraft = computed<SubscriptionDetails | null>(() => {
    if (this.editForm().invalid()) return null;
    const { name, price, billingFrequency, currency, reason } = this.editModel();
    if (price === null || !billingFrequency || !currency) return null;
    return { name: name.trim(), price, billingFrequency, currency, reason };
  });

  constructor() {
    // Deliberately load opening values once; the form is recreated on each open.
    effect(() => {
      untracked(() => {
        const { name, price, billingFrequency, currency, reason } = this.subscription();
        this.editForm().reset({ name, price, billingFrequency, currency, reason });
      });
    });
  }

  focusName(): void {
    this.nameInput()?.nativeElement.focus();
  }

  errorText(field: ValidatedField): string | null {
    return fieldErrorText(this.editForm, field);
  }

  done(event: Event): void {
    event.preventDefault();
    const firstInvalid = firstInvalidField(this.editForm);
    if (firstInvalid) {
      this.toast()?.showError(firstInvalid.message, () =>
        this.editForm[firstInvalid.field]().value(),
      );
      this.editForm[firstInvalid.field]().focusBoundControl();
      return;
    }
    const draft = this.validDraft();
    // Defensive guard in case draft validation changes.
    if (!draft) return;
    const changes = changedEditFields(this.subscription(), draft);
    if (Object.keys(changes).length > 0) {
      this.state.edit(this.subscription().id, changes);
    }
    this.closed.emit();
  }
}
