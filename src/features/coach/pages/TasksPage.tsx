import { Check, ListChecks } from 'lucide-react';
import { useTasks, useToggleTask } from '@/hooks/useTasks';
import { usePlayers } from '@/hooks/usePlayers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { TaskPriority } from '@/types/domain';
import { AddTaskDialog } from '../components/AddTaskDialog';
import { tapHaptic } from '@/lib/haptics';

const PRIORITY: Record<TaskPriority, { label: string; variant: 'muted' | 'warning' | 'danger' }> = {
  normal: { label: 'Normal', variant: 'muted' },
  high: { label: 'Alta', variant: 'warning' },
  urgent: { label: 'Urgente', variant: 'danger' },
};

export function TasksPage() {
  const { data: tasks, isLoading, isError } = useTasks();
  const { data: players } = usePlayers();
  const toggle = useToggleTask();
  const nameById = new Map((players ?? []).map((p) => [p.id, p.name]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Tareas</h1>
          <p className="text-sm text-muted-foreground">
            {(tasks ?? []).filter((t) => !t.done).length} pendientes
          </p>
        </div>
        <AddTaskDialog />
      </div>

      {isError && (
        <Card className="p-6 text-center text-sm text-destructive">No se pudieron cargar las tareas.</Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : (tasks?.length ?? 0) === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <ListChecks className="size-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Sin tareas aún</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Asigna la primera tarea a un jugador.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {(tasks ?? []).map((t) => {
            const prio = PRIORITY[(t.priority ?? 'normal') as TaskPriority];
            return (
              <Card key={t.id} className="flex items-center gap-3 p-3.5">
                <button
                  type="button"
                  aria-label={t.done ? 'Marcar pendiente' : 'Marcar hecha'}
                  onClick={() => {
                    void tapHaptic();
                    toggle.mutate({ id: t.id, done: !t.done });
                  }}
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors',
                    t.done ? 'border-success bg-success text-white' : 'border-border text-transparent',
                  )}
                >
                  <Check className="size-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className={cn('truncate text-sm font-medium', t.done && 'text-muted-foreground line-through')}>
                    {t.description}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {nameById.get(t.player_id ?? '') ?? '—'}
                    {t.due_date ? ` · vence ${t.due_date}` : ''}
                  </div>
                </div>
                <Badge variant={prio.variant} className="shrink-0">
                  {prio.label}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
