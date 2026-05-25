import { Trophy } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { usePlayers } from '@/hooks/usePlayers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/utils';
import { AddMatchDialog } from '../components/AddMatchDialog';
import { resultMeta } from '../lib/match-ui';

export function MatchesPage() {
  const { data: matches, isLoading, isError } = useMatches();
  const { data: players } = usePlayers();
  const nameById = new Map((players ?? []).map((p) => [p.id, p.name]));

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Partidos</h1>
          <p className="text-sm text-muted-foreground">{matches?.length ?? 0} registrados</p>
        </div>
        <AddMatchDialog />
      </div>

      {isError && (
        <Card className="p-6 text-center text-sm text-destructive">No se pudieron cargar los partidos.</Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (matches?.length ?? 0) === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Trophy className="size-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Sin partidos aún</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Registra el primer partido de un jugador para empezar a seguir su minutaje.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {(matches ?? []).map((m) => {
            const meta = resultMeta(m.result);
            return (
              <Card key={m.id} className="flex items-center gap-4 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">
                  {initials(nameById.get(m.player_id) ?? '?')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {nameById.get(m.player_id) ?? 'Jugador'} <span className="text-muted-foreground">vs</span>{' '}
                    {m.rival ?? '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(m.date)} · {m.mins ?? 0}&apos; · {m.role ?? '—'}
                  </div>
                </div>
                <Badge variant={meta.variant} className="shrink-0 font-display text-sm">
                  {meta.label}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
