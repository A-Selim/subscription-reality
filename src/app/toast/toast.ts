import { Component, computed, DestroyRef, inject, signal } from '@angular/core';

export const TOAST_DURATION_MS = 4000;

interface ToastMessage {
  id: number;
  text: string;
}

@Component({
  selector: 'app-toast',
  template: `
    @for (message of current(); track message.id) {
      <span>{{ message.text }}</span>
    }
  `,
  styleUrl: './toast.scss',
  host: {
    role: 'status',
    '[class.toast-visible]': 'visible()',
  },
})
export class Toast {
  private readonly destroyRef = inject(DestroyRef);
  private readonly message = signal<ToastMessage | null>(null);
  private nextId = 0;
  private timeout: ReturnType<typeof setTimeout> | undefined;

  protected readonly current = computed(() => {
    const message = this.message();
    return message ? [message] : [];
  });
  protected readonly visible = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  show(text: string): void {
    this.clearTimer();
    this.message.set({ id: ++this.nextId, text });
    this.visible.set(true);
    this.timeout = setTimeout(() => {
      this.visible.set(false);
      this.timeout = undefined;
    }, TOAST_DURATION_MS);
  }

  private clearTimer(): void {
    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }
}
