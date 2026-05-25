import { Trophy } from 'lucide-react';
import { useMyMatches, useMyPlayer } from '@/hooks/usePlayerData';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { resultMeta } from '@/features/coach/lib/match-ui';

export function PlayerMatchesPage() {
  const { data: player } = useMyPlayer();
  const { data: matches, isLoading } = useMyMatches(player?.id);

  return (
    <div className="space-y-4 pt-1">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Tus partidos</h1>
        <p className="text-sm text-muted-foreground">{matches?.length ?? 0} registrados</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (matches?.length ?? 0) === 0 ? (
        <Card className="p-10 text-center">
          <Trophy className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aún no hay partidos.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {(matches ?? []).map((m) => {
            const meta = resultMeta(m.result);
            return (
              <Card key={m.id} className="flex items-center gap-3 p-3.5">
                <span
                  className={cn(
                    'rounded-md px-2.5 py-1 font-display text-sm font-extrabold',
                    meta.variant === 'success' && 'bg-success/15 text-success',
                    meta.variant === 'warning' && 'bg-warning/15 text-warning',
                    meta.variant === 'danger' && 'bg-destructive/15 text-destructive',
                    meta.variant === 'muted' && 'bg-secondary text-muted-foreground',
                  )}
                >
                  {meta.label}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">vs {m.rival ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.date} · {m.mins ?? 0}&apos; · {m.role ?? '—'}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
