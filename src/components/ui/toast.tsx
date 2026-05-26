import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subscribeToasts, toast, type ToastItem, type ToastVariant } from '@/lib/toast';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
} as const;

const ACCENTS: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-primary',
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToasts(setItems), []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      aria-live="polite"
      role="status"
    >
      {items.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xl animate-in fade-in-0 slide-in-from-bottom-2"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', ACCENTS[t.variant])} />
            <p className="flex-1 text-sm text-foreground">{t.message}</p>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Cerrar aviso"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
