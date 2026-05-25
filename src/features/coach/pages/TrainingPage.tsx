import { Dumbbell } from 'lucide-react';
import { useTrainings } from '@/hooks/useTrainings';
import { usePlayers } from '@/hooks/usePlayers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/utils';
import { AddTrainingDialog } from '../components/AddTrainingDialog';

export function TrainingPage() {
  const { data: trainings, isLoading, isError } = useTrainings();
  const { data: players } = usePlayers();
  const nameById = new Map((players ?? []).map((p) => [p.id, p.name]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Entrenamientos</h1>
          <p className="text-sm text-muted-foreground">{trainings?.length ?? 0} sesiones</p>
        </div>
        <AddTrainingDialog />
      </div>

      {isError && (
        <Card className="p-6 text-center text-sm text-destructive">No se pudieron cargar las sesiones.</Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (trainings?.length ?? 0) === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Dumbbell className="size-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Sin sesiones aún</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Registra la primera sesión para seguir la carga de tus jugadores.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {(trainings ?? []).map((s) => (
            <Card key={s.id} className="flex items-center gap-4 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">
                {initials(nameById.get(s.player_id ?? '') ?? '?')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {nameById.get(s.player_id ?? '') ?? 'Jugador'} · {s.type ?? '—'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.date} · {s.duration ?? 0} min{s.goal ? ` · ${s.goal}` : ''}
                </div>
              </div>
              <Badge variant="muted" className="shrink-0">
                RPE {s.rpe ?? '—'}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
