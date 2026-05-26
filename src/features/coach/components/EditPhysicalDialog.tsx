import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
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
import { useUpdatePlayer } from '@/hooks/usePlayers';
import { notifyHaptic } from '@/lib/haptics';
import { toast } from '@/lib/toast';
import type { Player, UpdatePlayerInput } from '@/types/domain';

type Field = keyof Pick<
  UpdatePlayerInput,
  'height_cm' | 'weight_kg' | 'vertical_jump' | 'horizontal_jump' | 'flexibility_cmj' | 'rm_squat' | 'rm_deadlift' | 'rm_bench'
>;

const FIELDS: Array<{ key: Field; label: string; step?: string }> = [
  { key: 'height_cm', label: 'Altura (cm)' },
  { key: 'weight_kg', label: 'Peso (kg)' },
  { key: 'vertical_jump', label: 'Salto vertical (cm)' },
  { key: 'horizontal_jump', label: 'Salto horizontal (cm)' },
  { key: 'flexibility_cmj', label: 'CMJ (cm)', step: '0.1' },
  { key: 'rm_squat', label: 'RM Sentadilla (kg)' },
  { key: 'rm_deadlift', label: 'RM Peso muerto (kg)' },
  { key: 'rm_bench', label: 'RM Press banca (kg)' },
];

export function EditPhysicalDialog({ player, trigger }: { player: Player; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const update = useUpdatePlayer();
  const [values, setValues] = useState<Record<Field, string>>(() => {
    const init = {} as Record<Field, string>;
    for (const { key } of FIELDS) init[key] = player[key] != null ? String(player[key]) : '';
    return init;
  });

  async function save() {
    const patch: UpdatePlayerInput = {};
    for (const { key } of FIELDS) {
      const raw = values[key].trim();
      patch[key] = raw === '' ? null : Number(raw);
    }
    await update.mutateAsync({ id: player.id, patch });
    await notifyHaptic();
    toast.success('Valoración física actualizada');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Valoración física</DialogTitle>
          <DialogDescription>Antropometría, saltos y fuerza máxima.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(({ key, label, step }) => (
            <div key={key}>
              <Label htmlFor={`phys-${key}`}>{label}</Label>
              <Input
                id={`phys-${key}`}
                type="number"
                min={0}
                step={step}
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={save} disabled={update.isPending}>
            {update.isPending && <Loader2 className="animate-spin" />} Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
