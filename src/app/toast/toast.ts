import { Component, computed, effect, input, linkedSignal } from '@angular/core';

export const TOAST_DURATION_MS = 4000;

export interface ToastMessage {
  id: number;
  text: string;
}

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast" role="status" [class.toast-visible]="visible()">{{ text() }}</div>
  `,
  styleUrl: './toast.scss',
  host: {
    '[class.toast-host-visible]': 'visible()',
  },
})
export class Toast {
  readonly message = input<ToastMessage | null>(null);
  protected readonly text = computed(() => this.message()?.text ?? '');
  protected readonly visible = linkedSignal(() => this.message() !== null);

  constructor() {
    effect((onCleanup) => {
      if (!this.message()) {
        return;
      }

      const timeout = setTimeout(() => this.visible.set(false), TOAST_DURATION_MS);
      onCleanup(() => clearTimeout(timeout));
    });
  }
}
