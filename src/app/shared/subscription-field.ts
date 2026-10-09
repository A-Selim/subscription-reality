import { Component, Directive, inject, input } from '@angular/core';

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
    <ng-content />
    @if (errorText(); as error) {
      <span [id]="errorId" class="visually-hidden">{{ error }}</span>
    }
  `,
  styles: `
    :host {
      display: contents;
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
}

@Directive({
  selector: 'input[subscriptionControl], select[subscriptionControl]',
  host: {
    '[id]': 'field.controlId()',
    '[attr.aria-invalid]': "field.errorText() ? 'true' : null",
    '[attr.aria-describedby]': 'field.errorText() ? field.errorId : null',
  },
})
export class SubscriptionControl {
  readonly field = inject(SubscriptionField);
}
