import { Component, inject } from '@angular/core';
import { Review } from '../review/review';
import { Savings } from '../savings/savings';

import { SubscriptionsState } from '../state/subscriptions-state';

@Component({
  selector: 'app-review-area',
  host: { '[class.has-subscriptions]': 'hasSubscriptions()' },
  imports: [Review, Savings],
  templateUrl: './review-area.html',
  styleUrl: './review-area.scss',
})
export class ReviewArea {
  protected readonly hasSubscriptions = inject(SubscriptionsState).hasSubscriptions;
}
