// Types of the toast() API exported by toast.js, for TypeScript apps (TS resolves "./toast.js" to this file).

export type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading";

export interface ToastOptions {
  /** Second line under the message. */
  description?: string | Node;
  type?: ToastType;
  /** Button in the toast: onClick runs, then the toast closes unless onClick calls event.preventDefault(). */
  action?: { label: string; onClick?: (event: MouseEvent, toast: { id: string }) => void };
  /** Secondary button. */
  cancel?: { label: string; onClick?: (event: MouseEvent, toast: { id: string }) => void };
  /** Milliseconds before it closes (default: the toaster's `duration`). Infinity keeps it open. */
  duration?: number;
  /** Calling toast() again with the same id updates that toast in place. */
  id?: string;
  /** Custom icon element, or null for no icon. */
  icon?: Node | null;
  closeButton?: boolean;
  dismissible?: boolean;
  /** Announced as an alert (interrupts the screen reader) instead of politely. */
  important?: boolean;
  /** Selector of the <mv-toaster> to use (default: the first one, created if missing). */
  toaster?: string;
  onDismiss?: (toast: { id: string }) => void;
  onAutoClose?: (toast: { id: string }) => void;
}

/** A toast written as options, with its message: what toast.promise success / error may give. */
type ToastContent = ToastOptions & { message?: string | Node };

/** A message, an options object ({ message, description, ... }), or a function of the settled value returning either. null or undefined dismisses the toast. */
type ToastMessage<T> = string | Node | ToastContent | null | ((value: T) => string | Node | ToastContent | null | undefined);

export interface ToastFn {
  /** Shows a toast and returns its id. */
  (message: string | Node, options?: ToastOptions): string | null;
  success(message: string | Node, options?: ToastOptions): string | null;
  error(message: string | Node, options?: ToastOptions): string | null;
  warning(message: string | Node, options?: ToastOptions): string | null;
  info(message: string | Node, options?: ToastOptions): string | null;
  loading(message: string | Node, options?: ToastOptions): string | null;
  /** Dismisses one toast by id, or every toast when omitted. */
  dismiss(id?: string, options?: { toaster?: string }): void;
  /** Loading toast that turns into success or error when the promise settles. */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: { loading?: string | Node; success?: ToastMessage<T>; error?: ToastMessage<unknown>; description?: string | Node },
    options?: ToastOptions,
  ): Promise<T> & { id: string | null };
}

export const toast: ToastFn;

export class MvToaster extends HTMLElement {
  static toast: ToastFn;
  /** Adds a toast, or updates the one with the same id. Returns its id. */
  add(options?: ToastContent): string;
  /** Dismisses one toast, or all when `id` is omitted. */
  dismiss(id?: string): void;
  readonly toasts: Array<ToastOptions & { message?: string }>;
  /** The generated <section class="mv-toaster"> live region, null until the first toast. */
  readonly region: HTMLElement | null;
  /** Overrides for the default text (en-US): regionLabel, close, loading. App-wide: setStrings() in core/i18n.js, key "toaster". */
  strings: Partial<Record<"regionLabel" | "close" | "loading", string>>;
}
