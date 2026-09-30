import { Component, computed, DestroyRef, inject, signal } from '@angular/core';

export const TOAST_DURATION_MS = 4000;
export const TOAST_FADE_MS = 180;

export type ToastVariant = 'success' | 'error';

interface ToastMessage {
  id: number;
  text: string;
  variant: ToastVariant;
}

@Component({
  selector: 'app-toast',
  template: `
    @for (message of current(); track message.id) {
      <span>
        @if (message.variant === 'error') {
          <span aria-hidden="true">⚠ </span>
        }
        {{ message.text }}
      </span>
    }
  `,
  styleUrl: './toast.scss',
  host: {
    role: 'status',
    '[class.toast-visible]': 'visible()',
    '[class.toast-error]': 'error()',
  },
})
export class Toast {
  private readonly destroyRef = inject(DestroyRef);
  private readonly message = signal<ToastMessage | null>(null);
  private nextId = 0;
  private hideTimeout: ReturnType<typeof setTimeout> | undefined;
  private clearMessageTimeout: ReturnType<typeof setTimeout> | undefined;

  protected readonly current = computed(() => {
    const message = this.message();
    return message ? [message] : [];
  });
  protected readonly error = computed(() => this.message()?.variant === 'error');
  protected readonly visible = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  show(text: string, variant: ToastVariant = 'success'): void {
    this.clearTimer();
    this.message.set({ id: ++this.nextId, text, variant });
    this.visible.set(true);
    this.hideTimeout = setTimeout(() => {
      this.visible.set(false);
      this.hideTimeout = undefined;
      this.clearMessageTimeout = setTimeout(() => {
        this.message.set(null);
        this.clearMessageTimeout = undefined;
      }, TOAST_FADE_MS);
    }, TOAST_DURATION_MS);
  }

  private clearTimer(): void {
    if (this.hideTimeout !== undefined) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
    if (this.clearMessageTimeout !== undefined) {
      clearTimeout(this.clearMessageTimeout);
      this.clearMessageTimeout = undefined;
    }
  }
}
