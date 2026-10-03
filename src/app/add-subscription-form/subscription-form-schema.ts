import { required, schema, validate } from '@angular/forms/signals';
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

export function createSubscriptionFormSchema(subscriptions: () => readonly Subscription[]) {
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

      const matchingSubscription = findSubscriptionNameMatch(subscriptions(), name);
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
