import { usePlayers } from '@/hooks/usePlayers';
import { useTrainings } from '@/hooks/useTrainings';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { scoreColor } from '../lib/player-ui';
import type { AIAttributes } from '@/types/domain';

const ATTR_LABELS: Record<keyof AIAttributes, string> = {
  tecnica: 'Técnica',
  tactica: 'Táctica',
  fisico: 'Físico',
  mental: 'Mental',
  velocidad: 'Velocidad',
  lectura: 'Lectura',
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-extrabold tracking-tight">{value}</div>
    </Card>
  );
}

export function MetricsPage() {
  const players = usePlayers();
  const trainings = useTrainings();
  const list = players.data ?? [];

  const totalMins = list.reduce((s, p) => s + (p.mins ?? 0), 0);
  const totalGoals = list.reduce((s, p) => s + (p.scored ?? 0), 0);
  const rpes = (trainings.data ?? []).map((t) => t.rpe ?? 0).filter((n) => n > 0);
  const avgRpe = rpes.length ? (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1) : '—';
  const ranked = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const withAttrs = list.filter((p) => p.ai_attributes);
  const avgAttrs = (Object.keys(ATTR_LABELS) as Array<keyof AIAttributes>).map((k) => ({
    key: k,
    label: ATTR_LABELS[k],
    value: withAttrs.length
      ? Math.round(withAttrs.reduce((s, p) => s + (p.ai_attributes![k] ?? 0), 0) / withAttrs.length)
      : 0,
  }));

  if (players.isLoading) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Métricas</h1>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Métricas</h1>
        <p className="text-sm text-muted-foreground">Vista agregada de tu plantilla.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Minutos totales" value={totalMins} />
        <Stat label="Goles" value={totalGoals} />
        <Stat label="Sesiones" value={trainings.data?.length ?? 0} />
        <Stat label="RPE medio" value={avgRpe} />
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Ranking por score
        </h2>
        {ranked.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay jugadores.</p>
        ) : (
          <div className="space-y-3">
            {ranked.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-28 shrink-0 truncate text-sm font-medium">{p.name}</div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${Math.min(100, p.score ?? 0)}%` }}
                  />
                </div>
                <div className={cn('w-8 text-right font-display text-sm font-extrabold', scoreColor(p.score))}>
                  {p.score ?? '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Atributos IA (media de la plantilla)
        </h2>
        {withAttrs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Genera métricas IA en el pasaporte de tus jugadores para ver la media de atributos.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {avgAttrs.map((a) => (
              <div key={a.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">{a.label}</span>
                  <span className="font-display font-bold">{a.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${a.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
