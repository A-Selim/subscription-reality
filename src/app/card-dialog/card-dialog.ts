import { Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import {
  billingUnitLabel,
  formatMoney,
  monogram,
  otherUnitCostText,
  type Subscription,
} from '../domain/subscription';

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
  readonly showOtherUnit = input(false);
  readonly monogram = monogram;
  readonly billingUnitLabel = billingUnitLabel;
  readonly price = computed(() => {
    const subscription = this.subscription();
    return subscription ? formatMoney(subscription.price, subscription.currency) : '';
  });
  readonly otherUnit = computed(() => {
    const subscription = this.subscription();
    if (!subscription) return '';

    return otherUnitCostText(subscription);
  });
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private pointerDownOnBackdrop = false;

  open(): void {
    this.dialog().nativeElement.showModal();
    this.closeButton()?.nativeElement.focus();
  }

  dismiss(event?: Event): void {
    event?.preventDefault();
    this.dialog().nativeElement.close();
  }

  // The press must also start on the backdrop, so a drag that ends there doesn't close the dialog.
  recordBackdropPointerDown(event: MouseEvent): void {
    this.pointerDownOnBackdrop = this.isBackdropEvent(event);
  }

  dismissOnBackdropClick(event: MouseEvent): void {
    const pointerDownOnBackdrop = this.pointerDownOnBackdrop;
    this.pointerDownOnBackdrop = false;
    if (pointerDownOnBackdrop && this.isBackdropEvent(event)) this.dismiss();
  }

  private isBackdropEvent(event: MouseEvent): boolean {
    const dialog = this.dialog().nativeElement;
    if (event.target !== dialog) return false;
    const bounds = dialog.getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  }
}
