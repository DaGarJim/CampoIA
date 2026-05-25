import { Check, ListChecks } from 'lucide-react';
import { useMyPlayer, useMyTasks, useToggleMyTask } from '@/hooks/usePlayerData';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { notifyHaptic, tapHaptic } from '@/lib/haptics';

export function PlayerTasksPage() {
  const { data: player } = useMyPlayer();
  const { data: tasks, isLoading } = useMyTasks(player?.id);
  const toggle = useToggleMyTask(player?.id);
  const list = tasks ?? [];

  return (
    <div className="space-y-4 pt-1">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Misiones</h1>
        <p className="text-sm text-muted-foreground">{list.filter((t) => !t.done).length} pendientes</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card className="p-10 text-center">
          <ListChecks className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No tienes misiones todavía.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((t) => (
            <Card key={t.id} className="flex items-center gap-3 p-3.5">
              <button
                type="button"
                aria-label={t.done ? 'Marcar pendiente' : 'Completar'}
                onClick={() => {
                  if (!t.done) void notifyHaptic();
                  else void tapHaptic();
                  toggle.mutate({ id: t.id, done: !t.done });
                }}
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors active:scale-90',
                  t.done ? 'border-success bg-success text-white' : 'border-border text-transparent',
                )}
              >
                <Check className="size-4" />
              </button>
              <div className="min-w-0 flex-1">
                <div className={cn('truncate text-sm font-semibold', t.done && 'text-muted-foreground line-through')}>
                  {t.description}
                </div>
                <div className="text-xs text-muted-foreground">{t.type ?? 'Tarea'}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
