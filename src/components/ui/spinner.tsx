import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary',
        className,
      )}
    />
  );
}
