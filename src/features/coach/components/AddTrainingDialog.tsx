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
import { useCreateTraining } from '@/hooks/useTrainings';
import { notifyHaptic } from '@/lib/haptics';

const TRAINING_TYPES = [
  'Técnica individual',
  'Físico',
  'Velocidad',
  'Fuerza',
  'Movilidad',
  'Finalización',
  '1v1',
  'Confianza',
  'Prepartido',
  'Recuperación',
];

const schema = z.object({
  player_id: z.string().min(1, 'Selecciona un jugador'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  type: z.string().min(1, 'Selecciona el tipo'),
  duration: z.coerce.number().int().min(10, 'Mínimo 10 min').max(180, 'Máximo 180 min'),
  rpe: z.coerce.number().int().min(1).max(10).optional(),
  goal: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AddTrainingDialog({
  defaultPlayerId,
  trigger,
}: { defaultPlayerId?: string; trigger?: ReactNode } = {}) {
  const [open, setOpen] = useState(false);
  const { data: players } = usePlayers();
  const create = useCreateTraining();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'Técnica individual', player_id: defaultPlayerId ?? '' },
  });

  async function onSubmit(values: FormValues) {
    await create.mutateAsync({
      player_id: values.player_id,
      date: values.date,
      type: values.type,
      duration: values.duration,
      rpe: values.rpe,
      goal: values.goal,
      notes: values.notes,
    });
    await notifyHaptic();
    reset({ type: 'Técnica individual', player_id: defaultPlayerId ?? '' });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button disabled={(players?.length ?? 0) === 0}>
            <Plus /> Nueva sesión
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva sesión de entrenamiento</DialogTitle>
          <DialogDescription>Registra una sesión individual.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {!defaultPlayerId && (
            <div>
              <Label htmlFor="tr-player">Jugador</Label>
              <Select id="tr-player" defaultValue="" {...register('player_id')}>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tr-type">Tipo</Label>
              <Select id="tr-type" {...register('type')}>
                {TRAINING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="tr-dur">Duración (min)</Label>
              <Input id="tr-dur" type="number" min={10} max={180} placeholder="60" {...register('duration')} />
              {errors.duration && <p className="mt-1 text-xs text-destructive">{errors.duration.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tr-date">Fecha</Label>
              <Input id="tr-date" type="date" {...register('date')} />
              {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="tr-rpe">RPE (1-10)</Label>
              <Input id="tr-rpe" type="number" min={1} max={10} placeholder="7" {...register('rpe')} />
            </div>
          </div>
          <div>
            <Label htmlFor="tr-goal">Objetivo</Label>
            <Input id="tr-goal" placeholder="Foco principal de la sesión" {...register('goal')} />
          </div>
          {create.isError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {create.error instanceof Error ? create.error.message : 'No se pudo guardar.'}
            </p>
          )}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />} Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
