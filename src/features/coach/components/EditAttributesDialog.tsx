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
import type { AIAttributes, Player } from '@/types/domain';

const ATTRS: Array<{ key: keyof AIAttributes; label: string }> = [
  { key: 'tecnica', label: 'Técnica' },
  { key: 'tactica', label: 'Táctica' },
  { key: 'fisico', label: 'Físico' },
  { key: 'mental', label: 'Mental' },
  { key: 'velocidad', label: 'Velocidad' },
  { key: 'lectura', label: 'Lectura' },
];

const EMPTY: AIAttributes = { tecnica: 70, tactica: 70, fisico: 70, mental: 70, velocidad: 70, lectura: 70 };

export function EditAttributesDialog({ player, trigger }: { player: Player; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const update = useUpdatePlayer();
  const [attrs, setAttrs] = useState<AIAttributes>(player.ai_attributes ?? EMPTY);
  const [score, setScore] = useState<number>(player.score ?? 70);

  function set(key: keyof AIAttributes, value: number) {
    setAttrs((a) => ({ ...a, [key]: Math.max(0, Math.min(99, value)) }));
  }

  async function save() {
    await update.mutateAsync({ id: player.id, patch: { ai_attributes: attrs, score } });
    await notifyHaptic();
    toast.success('Atributos actualizados');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar atributos</DialogTitle>
          <DialogDescription>Valores de 0 a 99. Tras guardar, la IA puede recalcular métricas.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {ATTRS.map(({ key, label }) => (
            <div key={key}>
              <Label htmlFor={`attr-${key}`}>{label}</Label>
              <Input
                id={`attr-${key}`}
                type="number"
                min={0}
                max={99}
                value={attrs[key]}
                onChange={(e) => set(key, Number(e.target.value))}
              />
            </div>
          ))}
          <div className="col-span-2">
            <Label htmlFor="attr-score">Score global</Label>
            <Input
              id="attr-score"
              type="number"
              min={0}
              max={99}
              value={score}
              onChange={(e) => setScore(Math.max(0, Math.min(99, Number(e.target.value))))}
            />
          </div>
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
