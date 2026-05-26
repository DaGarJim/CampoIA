import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Dumbbell, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePlayers } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import { useTrainings } from '@/hooks/useTrainings';
import { useTasks } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, initials } from '@/lib/utils';
import type { Match, Player, TrainingSession } from '@/types/domain';
import { STATUS_META } from '../lib/player-ui';
import { AddPlayerDialog } from '../components/AddPlayerDialog';
import { OnboardingDialog } from '../components/OnboardingDialog';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // lunes = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

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
  const trainings = useTrainings();
  const tasks = useTasks();
  const firstName = name?.split(' ')[0] || 'Coach';

  const list: Player[] = players.data ?? [];
  const atRisk = list.filter((p) => p.status === 'risk' || p.status === 'injured');
  const top = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3);
  const loading = players.isLoading;

  const playerName = (id: string | null) => list.find((p) => p.id === id)?.name ?? '—';
  const pendingTasks = (tasks.data ?? []).filter((t) => !t.done);
  const priorityRank = { urgent: 0, high: 1, normal: 2 } as const;
  const upcomingTasks = [...pendingTasks]
    .sort((a, b) => {
      const pa = priorityRank[(a.priority ?? 'normal') as keyof typeof priorityRank];
      const pb = priorityRank[(b.priority ?? 'normal') as keyof typeof priorityRank];
      if (pa !== pb) return pa - pb;
      return (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999');
    })
    .slice(0, 3);
  const weekStart = startOfWeek(new Date());
  const week = DAY_LABELS.map((label, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      label,
      iso,
      isToday: iso === new Date().toISOString().slice(0, 10),
      matches: (matches.data ?? []).filter((m) => m.date === iso).length,
      trainings: (trainings.data ?? []).filter((t) => t.date === iso).length,
    };
  });
  const recent = [
    ...(matches.data ?? []).map((m) => ({ kind: 'match' as const, date: m.date, item: m })),
    ...(trainings.data ?? []).map((t) => ({ kind: 'training' as const, date: t.date, item: t })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-5">
      {!loading && <OnboardingDialog hasPlayers={list.length > 0} />}
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
        <div className="relative mt-4 flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="border-0 bg-white text-[#1e1b4b] hover:bg-white/90">
            <Link to="/players">
              Ver jugadores <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="secondary" className="border border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Link to="/ai">
              <Sparkles /> Sugerencias IA
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <Kpi label="Jugadores" value={list.length} />
            <Kpi label="Partidos" value={matches.data?.length ?? 0} accent="bg-accent/80" />
            <Kpi label="Sesiones" value={trainings.data?.length ?? 0} accent="bg-success/80" />
            <Kpi label="Tareas pendientes" value={pendingTasks.length} accent="bg-warning/80" />
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
        <>
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

        <section className="space-y-3">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Próximas tareas
          </h2>
          <Card className="divide-y divide-border">
            {upcomingTasks.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">No hay tareas pendientes.</div>
            ) : (
              upcomingTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3.5">
                  <Badge
                    variant={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'muted'}
                    className="shrink-0"
                  >
                    {t.priority === 'urgent' ? 'Urgente' : t.priority === 'high' ? 'Alta' : 'Normal'}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{t.description}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {playerName(t.player_id)}
                      {t.due_date ? ` · vence ${t.due_date}` : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <CalendarDays className="size-3.5" /> Tu semana
            </h2>
            <div className="grid grid-cols-7 gap-1.5">
              {week.map((d) => (
                <div
                  key={d.iso}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border p-2',
                    d.isToday ? 'border-primary bg-primary/10' : 'border-border',
                  )}
                >
                  <span className="text-[10px] font-semibold text-muted-foreground">{d.label}</span>
                  <div className="flex min-h-4 flex-col items-center gap-0.5">
                    {d.matches > 0 && <span className="size-1.5 rounded-full bg-success" title="Partido" />}
                    {d.trainings > 0 && <span className="size-1.5 rounded-full bg-primary" title="Entreno" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-success" /> Partido</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-primary" /> Entreno</span>
            </div>
          </Card>

          <section className="space-y-3">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Actividad reciente
            </h2>
            <Card className="divide-y divide-border">
              {recent.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">Sin actividad todavía.</div>
              ) : (
                recent.map((r) => (
                  <div key={`${r.kind}-${r.item.id}`} className="flex items-center gap-3 p-3.5">
                    <div
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-lg',
                        r.kind === 'match' ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary',
                      )}
                    >
                      {r.kind === 'match' ? <Trophy className="size-4" /> : <Dumbbell className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {r.kind === 'match'
                          ? `${playerName((r.item as Match).player_id)} vs ${(r.item as Match).rival ?? '—'}`
                          : `${playerName((r.item as TrainingSession).player_id)} · ${(r.item as TrainingSession).type ?? 'Sesión'}`}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{r.date}</div>
                    </div>
                    {r.kind === 'match' && (
                      <span className="font-display text-sm font-bold">{(r.item as Match).result ?? '—'}</span>
                    )}
                  </div>
                ))
              )}
            </Card>
          </section>
        </div>
        </>
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
