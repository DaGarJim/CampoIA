import { useState } from 'react';
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
import { useCreateMatch } from '@/hooks/useMatches';
import { notifyHaptic } from '@/lib/haptics';
import { MATCH_ROLES } from '../lib/match-ui';

const schema = z.object({
  player_id: z.string().min(1, 'Selecciona un jugador'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  rival: z.string().min(1, 'Indica el rival'),
  result: z.string().optional(),
  mins: z.coerce.number().int().min(0).max(120).optional(),
  role: z.string().optional(),
  called: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AddMatchDialog() {
  const [open, setOpen] = useState(false);
  const { data: players } = usePlayers();
  const create = useCreateMatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { called: 'yes', role: 'Titular' } });

  const hasPlayers = (players?.length ?? 0) > 0;

  async function onSubmit(values: FormValues) {
    await create.mutateAsync({
      player_id: values.player_id,
      date: values.date,
      rival: values.rival.trim(),
      result: values.result?.trim() || undefined,
      mins: values.mins,
      role: values.role,
      called: values.called,
      notes: values.notes,
    });
    await notifyHaptic();
    reset({ called: 'yes', role: 'Titular' });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!hasPlayers}>
          <Plus /> Registrar partido
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar partido</DialogTitle>
          <DialogDescription>Partido de un jugador en su club.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="m-player">Jugador</Label>
            <Select id="m-player" defaultValue="" {...register('player_id')}>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-date">Fecha</Label>
              <Input id="m-date" type="date" {...register('date')} />
              {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="m-rival">Rival</Label>
              <Input id="m-rival" placeholder="Ej: Atlético Juvenil" {...register('rival')} />
              {errors.rival && <p className="mt-1 text-xs text-destructive">{errors.rival.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-result">Resultado</Label>
              <Input id="m-result" placeholder="Ej: 2-1" {...register('result')} />
            </div>
            <div>
              <Label htmlFor="m-mins">Minutos</Label>
              <Input id="m-mins" type="number" min={0} max={120} placeholder="0" {...register('mins')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-role">Rol</Label>
              <Select id="m-role" {...register('role')}>
                {MATCH_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="m-called">Convocado</Label>
              <Select id="m-called" {...register('called')}>
                <option value="yes">Sí</option>
                <option value="no">No</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="m-notes">Notas</Label>
            <Input id="m-notes" placeholder="Impresiones, acciones clave…" {...register('notes')} />
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
