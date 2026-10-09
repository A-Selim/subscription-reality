import { Component, computed, ElementRef, input, output, viewChild } from '@angular/core';
import {
  annualCost,
  billingUnitLabel,
  formatAnnualMoney,
  formatMoney,
  monogram,
  type Subscription,
} from '../domain/subscription';

@Component({
  selector: 'app-subscription-card',
  templateUrl: './subscription-card.html',
  styleUrl: './subscription-card.scss',
})
export class SubscriptionCard {
  readonly subscription = input.required<Subscription>();
  readonly opened = output<void>();
  readonly deleteRequested = output<void>();
  readonly monogram = monogram;
  readonly billingUnitLabel = billingUnitLabel;
  readonly priceText = computed(() =>
    formatMoney(this.subscription().price, this.subscription().currency),
  );
  readonly annualCostText = computed(() =>
    formatAnnualMoney(annualCost(this.subscription()), this.subscription().currency),
  );
  private readonly cardButton = viewChild<ElementRef<HTMLButtonElement>>('cardButton');
  private readonly deleteButton = viewChild<ElementRef<HTMLButtonElement>>('deleteButton');

  focusCard(): void {
    this.cardButton()?.nativeElement.focus();
  }
  focusDeleteButton(): void {
    this.deleteButton()?.nativeElement.focus();
  }
}
