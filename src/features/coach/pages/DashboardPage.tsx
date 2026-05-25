import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePlayers } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, initials } from '@/lib/utils';
import type { Player } from '@/types/domain';
import { STATUS_META } from '../lib/player-ui';
import { AddPlayerDialog } from '../components/AddPlayerDialog';

function Kpi({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <Card className="relative overflow-hidden p-4">
      <div className={cn('absolute inset-y-0 left-0 w-1', accent ?? 'bg-primary/80')} />
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-extrabold tracking-tight">{value}</div>
    </Card>
  );
}

export function DashboardPage() {
  const { name } = useAuth();
  const players = usePlayers();
  const matches = useMatches();
  const firstName = name?.split(' ')[0] || 'Coach';

  const list: Player[] = players.data ?? [];
  const atRisk = list.filter((p) => p.status === 'risk' || p.status === 'injured');
  const avgAdherence =
    list.length > 0
      ? Math.round(list.reduce((sum, p) => sum + (p.adherence ?? 0), 0) / list.length)
      : 0;
  const top = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3);
  const loading = players.isLoading;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight lg:text-3xl">Hola, {firstName}</h1>
        <p className="text-sm text-muted-foreground">Tu centro de mando del día.</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#5b21b6] to-[#0e7490] p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-14 size-56 rounded-full bg-cyan-400/30 blur-2xl" />
        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest">
          Resumen del día
        </span>
        <p className="relative mt-3 max-w-lg font-display text-lg font-bold leading-snug">
          {atRisk.length > 0
            ? `Tienes ${atRisk.length} jugador${atRisk.length > 1 ? 'es' : ''} que requiere${atRisk.length > 1 ? 'n' : ''} atención hoy.`
            : 'Todo en orden. Revisa la evolución de tu plantilla.'}
        </p>
        <Button asChild variant="secondary" className="mt-4 border-0 bg-white text-[#1e1b4b] hover:bg-white/90">
          <Link to="/players">
            Ver jugadores <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <Kpi label="Jugadores" value={list.length} />
            <Kpi label="Adherencia media" value={`${avgAdherence}%`} accent="bg-accent/80" />
            <Kpi label="Partidos" value={matches.data?.length ?? 0} accent="bg-success/80" />
            <Kpi label="En riesgo" value={atRisk.length} accent="bg-warning/80" />
          </>
        )}
      </div>

      {!loading && list.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="font-display text-lg font-bold">Aún no hay jugadores</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Añade tu primer jugador para registrar partidos, entrenos y métricas.
          </p>
          <div className="mt-4 flex justify-center">
            <AddPlayerDialog />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="space-y-3">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Top de la plantilla
            </h2>
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {top.map((p) => (
                  <PlayerMini key={p.id} player={p} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Atención prioritaria
            </h2>
            <Card className="divide-y divide-border">
              {atRisk.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">Nadie en riesgo. Buen trabajo.</div>
              ) : (
                atRisk.map((p) => {
                  const meta = STATUS_META[p.status];
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-3.5">
                      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">
                        {initials(p.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{p.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{p.tag || p.club || '—'}</div>
                      </div>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                  );
                })
              )}
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}

function PlayerMini({ player }: { player: Player }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-extrabold text-white">
          {initials(player.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">{player.name}</div>
          <div className="truncate text-xs text-muted-foreground">{player.pos || '—'}</div>
        </div>
        <div className="font-display text-2xl font-extrabold">{player.score ?? '—'}</div>
      </div>
    </Card>
  );
}
