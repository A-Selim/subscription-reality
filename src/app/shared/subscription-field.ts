import { Component, computed, Directive, inject, input } from '@angular/core';

let nextFieldId = 0;

@Component({
  selector: 'app-subscription-field',
  template: `
    <label
      [for]="controlId()"
      [class.visually-hidden]="hiddenLabel()"
      [class.field-label]="!hiddenLabel()"
      >{{ label() }}</label
    >
    <span class="subscription-control-wrap">
      <ng-content />
      @if (hasError()) {
        <span class="invalid-field-mark" aria-hidden="true">!</span>
      }
    </span>
    @if (hasError()) {
      <span [id]="errorId" class="visually-hidden">{{ errorText() }}</span>
    }
  `,
  styles: `
    :host {
      display: contents;
    }

    .subscription-control-wrap {
      position: relative;
      display: block;
      min-width: 0;
    }

    .invalid-field-mark {
      position: absolute;
      top: 50%;
      /* Keeps the mark clear of the select chevron. */
      inset-inline-end: 36px;
      display: grid;
      width: 18px;
      height: 18px;
      place-items: center;
      transform: translateY(-50%);
      border-radius: 50%;
      background: var(--ink);
      color: white;
      font-size: 14px;
      font-weight: 900;
      line-height: 1;
      pointer-events: none;
    }
  `,
})
export class SubscriptionField {
  private readonly generatedId = `subscription-field-${++nextFieldId}`;
  readonly controlId = input(this.generatedId);
  readonly errorId = `${this.generatedId}-error`;
  readonly label = input.required<string>();
  readonly hiddenLabel = input(false);
  readonly errorText = input<string | null>(null);
  readonly hasError = computed(() => this.errorText() !== null);
}

@Directive({
  selector: 'input[subscriptionControl], select[subscriptionControl]',
  host: {
    '[id]': 'field.controlId()',
    '[attr.aria-invalid]': "field.hasError() ? 'true' : null",
    '[attr.aria-describedby]': 'field.hasError() ? field.errorId : null',
    // Projected controls are outside encapsulated styles, so this inline 64px padding clears the mark and select chevron.
    '[style.padding-inline-end]': "field.hasError() ? '64px' : null",
  },
})
export class SubscriptionControl {
  readonly field = inject(SubscriptionField);
}
