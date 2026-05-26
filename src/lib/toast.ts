export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l([...toasts]);
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(message: string, variant: ToastVariant, duration = 3800) {
  const id = nextId++;
  toasts = [...toasts, { id, message, variant, duration }];
  emit();
  if (duration > 0) setTimeout(() => dismiss(id), duration);
  return id;
}

/** API imperativa de toasts, invocable desde cualquier capa (servicios, hooks, UI). */
export const toast = {
  success: (message: string, duration?: number) => push(message, 'success', duration),
  error: (message: string, duration?: number) => push(message, 'error', duration),
  warning: (message: string, duration?: number) => push(message, 'warning', duration),
  info: (message: string, duration?: number) => push(message, 'info', duration),
  dismiss,
};
