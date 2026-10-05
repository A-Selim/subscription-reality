import { required, schema, validate, type FieldTree } from '@angular/forms/signals';
import {
  findSubscriptionNameMatch,
  isValidName,
  isValidPrice,
  NAME_MAX_LENGTH,
  type BillingFrequency,
  type Currency,
  type Reason,
  type Subscription,
} from '../domain/subscription';

export interface SubscriptionFormFields {
  name: string;
  price: number | null;
  billingFrequency: BillingFrequency | '';
  currency: Currency | '';
  reason: Reason;
}

export type ValidatedField = 'name' | 'price' | 'billingFrequency' | 'currency';
const FIELD_ORDER: readonly ValidatedField[] = ['name', 'price', 'billingFrequency', 'currency'];

export function firstInvalidField(
  form: FieldTree<SubscriptionFormFields>,
): { field: ValidatedField; message: string } | undefined {
  for (const field of FIELD_ORDER) {
    const message = fieldErrorText(form, field);
    if (message !== null) return { field, message };
  }
  return undefined;
}

export function fieldErrorText(
  form: FieldTree<SubscriptionFormFields>,
  field: ValidatedField,
): string | null {
  const state = form[field]();
  return state.invalid() ? (state.errors()[0]?.message ?? 'Check this field.') : null;
}

export function createSubscriptionFormSchema(
  subscriptions: () => readonly Subscription[],
  editedSubscriptionId?: () => string,
) {
  return schema<SubscriptionFormFields>((path) => {
    validate(path.name, ({ value }) => {
      const name = value();
      if (!isValidName(name)) {
        return {
          kind: 'name',
          message: name.trim()
            ? `Use a subscription name with at most ${NAME_MAX_LENGTH} characters.`
            : 'Enter a subscription name.',
        };
      }

      const matchingSubscription = findSubscriptionNameMatch(
        subscriptions(),
        name,
        editedSubscriptionId?.(),
      );
      return matchingSubscription
        ? {
            kind: 'name',
            message: `You already have ${matchingSubscription.name}. Add something to tell them apart, like '${matchingSubscription.name} Family'.`,
          }
        : null;
    });
    required(path.price, { message: 'Enter a price.' });
    validate(path.price, ({ value }) => {
      const price = value();
      return price === null || isValidPrice(price)
        ? null
        : { kind: 'price', message: 'Enter a price greater than 0 with at most 2 decimal places.' };
    });
    required(path.billingFrequency, { message: 'Choose a billing frequency.' });
    required(path.currency, { message: 'Choose a currency.' });
  });
}
