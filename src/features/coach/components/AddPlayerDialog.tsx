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

const optNum = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.number().min(0).optional(),
);

const schema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  pos: z.string().min(1, 'Selecciona una posición'),
  age: z.coerce.number().int('Edad no válida').min(8, 'Edad no válida').max(60, 'Edad no válida'),
  foot: z.string().min(1, 'Selecciona el pie dominante'),
  club: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['available', 'risk', 'injured', 'unavailable']),
  height_cm: optNum,
  weight_kg: optNum,
  vertical_jump: optNum,
  horizontal_jump: optNum,
  flexibility_cmj: optNum,
  rm_squat: optNum,
  rm_deadlift: optNum,
  rm_bench: optNum,
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
      category: values.category?.trim() || undefined,
      status: values.status,
      height_cm: values.height_cm,
      weight_kg: values.weight_kg,
      vertical_jump: values.vertical_jump,
      horizontal_jump: values.horizontal_jump,
      flexibility_cmj: values.flexibility_cmj,
      rm_squat: values.rm_squat,
      rm_deadlift: values.rm_deadlift,
      rm_bench: values.rm_bench,
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-club">Club</Label>
              <Input id="p-club" placeholder="Club actual (opcional)" {...register('club')} />
            </div>
            <div>
              <Label htmlFor="p-cat">Categoría</Label>
              <Input id="p-cat" placeholder="Ej: Juvenil A" {...register('category')} />
            </div>
          </div>

          <details className="rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5">
            <summary className="cursor-pointer select-none text-sm font-semibold text-foreground">
              Datos físicos y valoración inicial (opcional)
            </summary>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="p-h">Altura (cm)</Label>
                  <Input id="p-h" type="number" min={0} placeholder="176" {...register('height_cm')} />
                </div>
                <div>
                  <Label htmlFor="p-w">Peso (kg)</Label>
                  <Input id="p-w" type="number" min={0} placeholder="68" {...register('weight_kg')} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="p-vj">Salto vert. (cm)</Label>
                  <Input id="p-vj" type="number" min={0} placeholder="42" {...register('vertical_jump')} />
                </div>
                <div>
                  <Label htmlFor="p-hj">Salto horiz. (cm)</Label>
                  <Input id="p-hj" type="number" min={0} placeholder="215" {...register('horizontal_jump')} />
                </div>
                <div>
                  <Label htmlFor="p-cmj">CMJ (cm)</Label>
                  <Input id="p-cmj" type="number" min={0} step="0.1" placeholder="34" {...register('flexibility_cmj')} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="p-sq">RM Sentadilla</Label>
                  <Input id="p-sq" type="number" min={0} placeholder="90" {...register('rm_squat')} />
                </div>
                <div>
                  <Label htmlFor="p-dl">RM P. muerto</Label>
                  <Input id="p-dl" type="number" min={0} placeholder="110" {...register('rm_deadlift')} />
                </div>
                <div>
                  <Label htmlFor="p-bp">RM Banca</Label>
                  <Input id="p-bp" type="number" min={0} placeholder="60" {...register('rm_bench')} />
                </div>
              </div>
            </div>
          </details>

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
