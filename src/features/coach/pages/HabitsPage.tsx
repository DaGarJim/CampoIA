import { useMemo } from 'react';
import { HeartPulse, TriangleAlert } from 'lucide-react';
import { usePlayers, useUpdatePlayerStatus } from '@/hooks/usePlayers';
import { useCheckins } from '@/hooks/useCheckins';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, initials } from '@/lib/utils';
import { STATUS_META } from '../lib/player-ui';
import type { CheckIn, PlayerStatus } from '@/types/domain';

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

function painColor(level: number | null): string {
  if (level == null) return 'text-muted-foreground';
  if (level >= 7) return 'text-destructive';
  if (level >= 4) return 'text-warning';
  return 'text-success';
}

export function HabitsPage() {
  const { data: players, isLoading } = usePlayers();
  const { data: checkins } = useCheckins();
  const updateStatus = useUpdatePlayerStatus();

  const latestByPlayer = useMemo(() => {
    const map = new Map<string, CheckIn>();
    for (const c of checkins ?? []) {
      if (!map.has(c.player_id)) map.set(c.player_id, c); // checkins vienen ordenados por fecha desc
    }
    return map;
  }, [checkins]);

  const list = players ?? [];
  const alerts = list.filter((p) => p.status !== 'available');
  const maxSleepRef = 9;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Hábitos</h1>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Hábitos</h1>
        <p className="text-sm text-muted-foreground">Bienestar y adherencia de tu plantilla.</p>
      </div>

      {alerts.length > 0 && (
        <Card className="flex items-center gap-3 border-warning/30 bg-warning/10 p-3.5 text-sm">
          <TriangleAlert className="size-5 shrink-0 text-warning" />
          <span className="text-foreground">
            {alerts.length} jugador{alerts.length > 1 ? 'es' : ''} fuera de disponibilidad plena. Revisa sus check-ins.
          </span>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Estado y último check-in
          </h2>
          <Card className="divide-y divide-border">
            {list.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">Aún no hay jugadores.</div>
            ) : (
              list.map((p) => {
                const c = latestByPlayer.get(p.id);
                const meta = STATUS_META[p.status];
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3.5">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">
                      {initials(p.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {c ? (
                          <>
                            <span>😴 {c.sleep_hours ?? '—'}h</span>
                            <span>{MOODS[(c.mood ?? 3) - 1]} ánimo</span>
                            <span>⚡ {c.energy ?? '—'}/5</span>
                            <span className={painColor(c.pain_level)}>
                              🤕 {c.pain_level ?? 0}/10{c.pain_zone ? ` · ${c.pain_zone}` : ''}
                            </span>
                          </>
                        ) : (
                          <span>Sin check-in reciente</span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge variant={meta.variant} className="cursor-pointer">
                          {meta.label} ▾
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(Object.keys(STATUS_META) as PlayerStatus[]).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => updateStatus.mutate({ id: p.id, status: s })}>
                            {STATUS_META[s].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })
            )}
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Adherencia y sueño
          </h2>
          <Card className="space-y-4 p-4">
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <HeartPulse className="size-3.5" /> Adherencia
              </div>
              <div className="space-y-2">
                {list.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="w-24 shrink-0 truncate text-xs">{p.name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${p.adherence ?? 0}%` }} />
                    </div>
                    <span className="w-9 text-right text-xs font-semibold">{p.adherence ?? 0}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-muted-foreground">😴 Sueño (última noche)</div>
              <div className="space-y-2">
                {list.map((p) => {
                  const h = latestByPlayer.get(p.id)?.sleep_hours ?? 0;
                  return (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 truncate text-xs">{p.name}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn('h-full rounded-full', h >= 7 ? 'bg-success' : h >= 5 ? 'bg-warning' : 'bg-destructive')}
                          style={{ width: `${Math.min(100, (h / maxSleepRef) * 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-semibold">{h || '—'}h</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
