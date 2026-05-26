import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { usePlayers } from '@/hooks/usePlayers';
import { useCreateTask } from '@/hooks/useTasks';
import { notifyHaptic } from '@/lib/haptics';

const TASK_TYPES = ['Técnica', 'Físico', 'Mental', 'Sueño', 'Nutrición', 'Recuperación', 'Vídeo', 'Táctica'];

const schema = z.object({
  player_id: z.string().min(1, 'Selecciona un jugador'),
  description: z.string().min(3, 'Describe la tarea'),
  type: z.string().optional(),
  priority: z.enum(['normal', 'high', 'urgent']),
  due_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AddTaskDialog({
  defaultPlayerId,
  trigger,
}: { defaultPlayerId?: string; trigger?: ReactNode } = {}) {
  const [open, setOpen] = useState(false);
  const { data: players } = usePlayers();
  const create = useCreateTask();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'Técnica', priority: 'normal', player_id: defaultPlayerId ?? '' },
  });

  async function onSubmit(values: FormValues) {
    await create.mutateAsync({
      player_id: values.player_id,
      description: values.description,
      type: values.type,
      priority: values.priority,
      due_date: values.due_date || undefined,
    });
    await notifyHaptic();
    reset({ type: 'Técnica', priority: 'normal', player_id: defaultPlayerId ?? '' });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button disabled={(players?.length ?? 0) === 0}>
            <Plus /> Nueva tarea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
          <DialogDescription>Asigna una tarea a un jugador.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {!defaultPlayerId && (
            <div>
              <Label htmlFor="t-player">Jugador</Label>
              <Select id="t-player" defaultValue="" {...register('player_id')}>
                <option value="" disabled>
                  Elige…
                </option>
                {(players ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              {errors.player_id && <p className="mt-1 text-xs text-destructive">{errors.player_id.message}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="t-desc">Descripción</Label>
            <Input id="t-desc" placeholder="Ej: 20 min de movilidad de cadera" {...register('description')} />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="t-type">Tipo</Label>
              <Select id="t-type" {...register('type')}>
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="t-priority">Prioridad</Label>
              <Select id="t-priority" {...register('priority')}>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="t-date">Fecha límite</Label>
            <Input id="t-date" type="date" {...register('due_date')} />
          </div>
          {create.isError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {create.error instanceof Error ? create.error.message : 'No se pudo guardar.'}
            </p>
          )}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />} Asignar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
