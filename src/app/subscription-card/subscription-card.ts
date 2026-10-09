import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
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
  billingUnitLabel,
  CURRENCIES,
  formatAnnualMoney,
  formatMoney,
  monogram,
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
  selector: 'app-subscription-card',
  imports: [FormField, Toast],
  templateUrl: './subscription-card.html',
  styleUrl: './subscription-card.scss',
})
export class SubscriptionCard {
  private readonly state = inject(SubscriptionsState);
  private readonly injector = inject(Injector);
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly cardButton = viewChild<ElementRef<HTMLButtonElement>>('cardButton');
  private readonly toast = viewChild(Toast);

  readonly subscription = input.required<Subscription>();
  readonly editing = input(false);
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly currencies = CURRENCIES;
  readonly billingFrequencies = BILLING_FREQUENCIES;
  readonly billingFrequencyLabels = BILLING_FREQUENCY_LABELS;
  readonly reasons = REASONS;
  readonly monogram = monogram;
  readonly billingUnitLabel = billingUnitLabel;
  readonly priceText = computed(() =>
    formatMoney(this.subscription().price, this.subscription().currency),
  );
  readonly annualCostText = computed(() =>
    formatAnnualMoney(annualCost(this.subscription()), this.subscription().currency),
  );
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

  private appliedEditFields: SubscriptionDetails | null = null;

  constructor() {
    effect(() => {
      if (!this.editing()) return;
      untracked(() => {
        const { name, price, billingFrequency, currency, reason } = this.subscription();
        this.appliedEditFields = { name, price, billingFrequency, currency, reason };
        this.editForm().reset(this.appliedEditFields);
        afterNextRender(() => this.nameInput()?.nativeElement.focus(), { injector: this.injector });
      });
    });
    effect(() => {
      if (!this.editing() || this.editForm().invalid()) return;
      const { name, price, billingFrequency, currency, reason } = this.editModel();
      if (price === null || !billingFrequency || !currency) return;
      untracked(() => {
        const fields = { name: name.trim(), price, billingFrequency, currency, reason };
        const changes = changedEditFields(this.appliedEditFields ?? fields, fields);
        this.appliedEditFields = fields;
        if (Object.keys(changes).length > 0) {
          this.state.edit(this.subscription().id, changes);
        }
      });
    });
  }

  errorText(field: ValidatedField): string | null {
    return fieldErrorText(this.editForm, field);
  }

  done(event: Event): void {
    event.preventDefault();
    const firstInvalid = firstInvalidField(this.editForm);
    if (firstInvalid) {
      this.toast()?.show(firstInvalid.message, 'error');
      this.editForm[firstInvalid.field]().focusBoundControl();
      return;
    }
    this.closed.emit();
    afterNextRender(() => this.cardButton()?.nativeElement.focus(), { injector: this.injector });
  }
}
