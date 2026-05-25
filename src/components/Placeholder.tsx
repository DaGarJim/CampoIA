import type { LucideIcon } from 'lucide-react';

interface PlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function Placeholder({ icon: Icon, title, description }: PlaceholderProps) {
  return (
    <div className="grid min-h-[55vh] place-items-center">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
          <Icon className="size-6" />
        </div>
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
        <span className="mt-4 inline-block rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          En construcción
        </span>
      </div>
    </div>
  );
}
