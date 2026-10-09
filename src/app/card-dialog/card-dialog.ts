import { Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import { billingUnitLabel, formatMoney, monogram, type Subscription } from '../domain/subscription';

@Component({
  selector: 'app-card-dialog',
  templateUrl: './card-dialog.html',
  styleUrl: './card-dialog.scss',
})
export class CardDialog {
  readonly subscription = input<Subscription | null>(null);
  readonly dismissed = output<void>();
  readonly labelledBy = input.required<string>();
  readonly describedBy = input<string | null>(null);
  readonly monogram = monogram;
  readonly billingUnitLabel = billingUnitLabel;
  readonly price = computed(() => {
    const subscription = this.subscription();
    return subscription ? formatMoney(subscription.price, subscription.currency) : '';
  });
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  open(): void {
    this.dialog().nativeElement.showModal();
    this.closeButton()?.nativeElement.focus();
  }

  dismiss(event?: Event): void {
    event?.preventDefault();
    this.dialog().nativeElement.close();
  }
}
