import { required, schema, validate } from '@angular/forms/signals';
import {
  isValidName,
  isValidPrice,
  NAME_MAX_LENGTH,
  type BillingFrequency,
  type Currency,
  type Reason,
} from '../domain/subscription';

export interface SubscriptionFormFields {
  name: string;
  price: number | null;
  billingFrequency: BillingFrequency | '';
  currency: Currency | '';
  reason: Reason;
}

export const subscriptionFormSchema = schema<SubscriptionFormFields>((path) => {
  validate(path.name, ({ value }) => {
    const name = value();
    return isValidName(name)
      ? null
      : {
          kind: 'name',
          message: name.trim()
            ? `Use a subscription name with at most ${NAME_MAX_LENGTH} characters.`
            : 'Enter a subscription name.',
        };
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
