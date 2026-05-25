import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus } from 'lucide-react';
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
import { useCreatePlayer } from '@/hooks/usePlayers';
import { notifyHaptic } from '@/lib/haptics';
import { FEET, POSITIONS } from '../lib/player-ui';

const schema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  pos: z.string().min(1, 'Selecciona una posición'),
  age: z.coerce.number().int('Edad no válida').min(8, 'Edad no válida').max(60, 'Edad no válida'),
  foot: z.string().min(1, 'Selecciona el pie dominante'),
  club: z.string().optional(),
  status: z.enum(['available', 'risk', 'injured', 'unavailable']),
});

type FormValues = z.infer<typeof schema>;

export function AddPlayerDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreatePlayer();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'available' },
  });

  async function onSubmit(values: FormValues) {
    await create.mutateAsync({
      name: values.name.trim(),
      pos: values.pos,
      age: values.age,
      foot: values.foot,
      club: values.club?.trim() || undefined,
      status: values.status,
    });
    await notifyHaptic();
    reset({ status: 'available' });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> Añadir jugador
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo jugador</DialogTitle>
          <DialogDescription>Añade una ficha a tu plantilla.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="p-name">Nombre</Label>
            <Input id="p-name" placeholder="Nombre y apellidos" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-pos">Posición</Label>
              <Select id="p-pos" defaultValue="" {...register('pos')}>
                <option value="" disabled>
                  Elige…
                </option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
              {errors.pos && <p className="mt-1 text-xs text-destructive">{errors.pos.message}</p>}
            </div>
            <div>
              <Label htmlFor="p-age">Edad</Label>
              <Input id="p-age" type="number" min={8} max={60} placeholder="Años" {...register('age')} />
              {errors.age && <p className="mt-1 text-xs text-destructive">{errors.age.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-foot">Pie</Label>
              <Select id="p-foot" defaultValue="" {...register('foot')}>
                <option value="" disabled>
                  Elige…
                </option>
                {FEET.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
              {errors.foot && <p className="mt-1 text-xs text-destructive">{errors.foot.message}</p>}
            </div>
            <div>
              <Label htmlFor="p-status">Estado</Label>
              <Select id="p-status" {...register('status')}>
                <option value="available">Disponible</option>
                <option value="risk">En riesgo</option>
                <option value="injured">Lesionado</option>
                <option value="unavailable">No disponible</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="p-club">Club</Label>
            <Input id="p-club" placeholder="Club actual (opcional)" {...register('club')} />
          </div>

          {create.isError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {create.error instanceof Error ? create.error.message : 'No se pudo guardar.'}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />} Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
