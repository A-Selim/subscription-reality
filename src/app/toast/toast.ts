import {
  Component,
  computed,
  DestroyRef,
  effect,
  type EffectRef,
  inject,
  Injector,
  signal,
} from '@angular/core';

export const TOAST_DURATION_MS = 1500;
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
  private readonly injector = inject(Injector);
  private readonly message = signal<ToastMessage | null>(null);
  private nextId = 0;
  private hideTimeout: ReturnType<typeof setTimeout> | undefined;
  private clearMessageTimeout: ReturnType<typeof setTimeout> | undefined;
  private errorWatch: EffectRef | undefined;

  protected readonly current = computed(() => {
    const message = this.message();
    return message ? [message] : [];
  });
  protected readonly error = computed(() => this.message()?.variant === 'error');
  protected readonly visible = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTimer();
      this.clearErrorWatch();
    });
  }

  show(text: string, variant: ToastVariant = 'success'): void {
    this.clearTimer();
    this.clearErrorWatch();
    this.message.set({ id: ++this.nextId, text, variant });
    this.visible.set(true);
    if (variant === 'error') return;
    this.hideTimeout = setTimeout(() => {
      this.hideTimeout = undefined;
      this.hide();
    }, TOAST_DURATION_MS);
  }

  showError(text: string, watch: () => unknown): void {
    const initialValue = watch();
    this.show(text, 'error');
    this.errorWatch = effect(
      () => {
        if (!Object.is(watch(), initialValue)) this.dismiss();
      },
      { injector: this.injector },
    );
  }

  dismiss(): void {
    this.clearTimer();
    this.hide();
  }

  private hide(): void {
    this.clearErrorWatch();
    this.visible.set(false);
    this.clearMessageTimeout = setTimeout(() => {
      this.message.set(null);
      this.clearMessageTimeout = undefined;
    }, TOAST_FADE_MS);
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

  private clearErrorWatch(): void {
    this.errorWatch?.destroy();
    this.errorWatch = undefined;
  }
}
