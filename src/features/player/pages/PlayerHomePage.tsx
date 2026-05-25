import { Check } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  useMyCheckins,
  useMyMatches,
  useMyPlayer,
  useMyTasks,
  useToggleMyTask,
} from '@/hooks/usePlayerData';
import { Card } from '@/components/ui/card';
import { Ring } from '@/components/ui/ring';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, initials } from '@/lib/utils';
import { notifyHaptic } from '@/lib/haptics';
import { resultMeta } from '@/features/coach/lib/match-ui';
import { levelOf, sleepScore, weekXp } from '../lib/gamify';

export function PlayerHomePage() {
  const { name } = useAuth();
  const { data: player, isLoading } = useMyPlayer();
  const tasks = useMyTasks(player?.id);
  const matches = useMyMatches(player?.id);
  const checkins = useMyCheckins(player?.id);
  const toggle = useToggleMyTask(player?.id);

  const firstName = (player?.name ?? name)?.split(' ')[0] || 'Jugador';
  const pending = (tasks.data ?? []).filter((t) => !t.done).slice(0, 4);
  const lastSleep = checkins.data?.[0]?.sleep_hours ?? null;

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3 pt-1">
        <div className="relative">
          <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display font-extrabold text-white">
            {initials(player?.name ?? name)}
          </div>
          <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-background bg-accent font-display text-[10px] font-extrabold text-accent-foreground">
            {levelOf(player)}
          </span>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Hola,</div>
          <div className="font-display text-lg font-extrabold leading-none">{firstName}</div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#0891b2] p-5 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-6 -top-10 size-36 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-extrabold">Nivel {levelOf(player)}</span>
          <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-extrabold">
            {player?.status === 'injured' ? '🩹 Recuperación' : '🔥 En forma'}
          </span>
        </div>
        <p className="relative mt-3 font-display text-xl font-extrabold leading-tight">
          {player?.tag || 'Listo para entrenar 💪'}
        </p>
        <div className="relative mt-4">
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="font-semibold text-white/85">XP de la semana</span>
            <span className="font-display font-extrabold">{weekXp(player)} / 100</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.8)] transition-all duration-1000 ease-out"
              style={{ width: `${weekXp(player)}%` }}
            />
          </div>
        </div>
      </div>

      {!player ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Tu entrenador aún no ha vinculado tu ficha. Pídele tu código de invitación.
          </p>
        </Card>
      ) : (
        <>
          {/* Misiones */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-extrabold">Misiones de hoy</h2>
                <p className="text-xs text-muted-foreground">
                  {pending.length === 0 ? 'Todo hecho. ¡Crack!' : `${pending.length} pendientes`}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {pending.length === 0 ? (
                <p className="py-2 text-center text-sm text-muted-foreground">Sin misiones pendientes 🎉</p>
              ) : (
                pending.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{t.description}</div>
                      <div className="text-xs text-muted-foreground">{t.type ?? 'Tarea'}</div>
                    </div>
                    <button
                      type="button"
                      aria-label="Completar"
                      onClick={() => {
                        void notifyHaptic();
                        toggle.mutate({ id: t.id, done: true });
                      }}
                      className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-border text-transparent transition-colors active:scale-90"
                    >
                      <Check className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Anillos */}
          <Card className="p-4">
            <h2 className="mb-4 font-display text-base font-extrabold">Tus anillos</h2>
            <div className="flex justify-around">
              <Ring value={player.adherence ?? 0} color="hsl(var(--primary))" label="Carga" display={`${player.adherence ?? 0}`} />
              <Ring value={player.score ?? 0} color="hsl(var(--accent))" label="Score" display={`${player.score ?? '—'}`} />
              <Ring value={sleepScore(lastSleep)} color="hsl(var(--success))" label="Descanso" display={lastSleep ? `${lastSleep}h` : '—'} />
            </div>
          </Card>

          {/* Últimos partidos */}
          {(matches.data?.length ?? 0) > 0 && (
            <Card className="p-4">
              <h2 className="mb-3 font-display text-base font-extrabold">Últimos partidos</h2>
              <div className="space-y-2">
                {(matches.data ?? []).slice(0, 3).map((m) => {
                  const meta = resultMeta(m.result);
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'rounded-md px-2 py-1 font-display text-xs font-extrabold',
                          meta.variant === 'success' && 'bg-success/15 text-success',
                          meta.variant === 'warning' && 'bg-warning/15 text-warning',
                          meta.variant === 'danger' && 'bg-destructive/15 text-destructive',
                          meta.variant === 'muted' && 'bg-secondary text-muted-foreground',
                        )}
                      >
                        {meta.label}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">vs {m.rival ?? '—'}</span>
                      <span className="text-xs text-muted-foreground">{m.mins ?? 0}&apos;</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
