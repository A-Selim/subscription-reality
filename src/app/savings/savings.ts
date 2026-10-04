import { Component, computed, inject } from '@angular/core';
import {
  decisionCounts,
  formatAnnualMoney,
  potentialSavingsPerCurrency,
  REVIEW_DECISIONS,
  REVIEW_DECISION_LABELS,
} from '../domain/subscription';
import { SubscriptionsState } from '../state/subscriptions-state';

@Component({
  selector: 'app-savings',
  templateUrl: './savings.html',
  styleUrl: './savings.scss',
})
export class Savings {
  private readonly state = inject(SubscriptionsState);
  protected readonly hasSubscriptions = this.state.hasSubscriptions;
  protected readonly potentialSavings = computed(() =>
    potentialSavingsPerCurrency(this.state.subscriptions()).map(({ currency, amount }) => ({
      currency,
      amount: formatAnnualMoney(amount, currency),
    })),
  );
  protected readonly decisions = REVIEW_DECISIONS;
  protected readonly decisionLabels = REVIEW_DECISION_LABELS;
  protected readonly decisionCounts = computed(() => decisionCounts(this.state.subscriptions()));
}
