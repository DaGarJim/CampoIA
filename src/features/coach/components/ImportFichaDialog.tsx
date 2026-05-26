import { useState } from 'react';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePlayer } from '@/hooks/usePlayers';
import { importPlayerFicha, type ParsedPlayerFicha } from '@/services/ai.service';
import { notifyHaptic } from '@/lib/haptics';
import { toast } from '@/lib/toast';
import type { PlayerStatus } from '@/types/domain';

export function ImportFichaDialog() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [ficha, setFicha] = useState<ParsedPlayerFicha | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const create = useCreatePlayer();

  async function analyze() {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const result = await importPlayerFicha(text);
      setFicha(result);
      if (!result.name) toast.warning('No se detectó el nombre. Revisa el texto.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo analizar la ficha.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function createFromFicha() {
    if (!ficha?.name) {
      toast.error('Falta el nombre del jugador.');
      return;
    }
    try {
      await create.mutateAsync({
        name: ficha.name,
        pos: ficha.pos || 'Mediocentro',
        age: ficha.age ?? 16,
        foot: ficha.foot || 'Derecho',
        club: ficha.club || undefined,
        category: ficha.category || undefined,
        status: 'available' as PlayerStatus,
        height_cm: ficha.height_cm,
        weight_kg: ficha.weight_kg,
      });
      await notifyHaptic();
      toast.success(`${ficha.name} añadido`);
      setFicha(null);
      setText('');
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el jugador.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wand2 /> Importar ficha (IA)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar ficha con IA</DialogTitle>
          <DialogDescription>
            Pega la ficha federativa o el perfil del jugador y la IA rellenará los datos.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Ej:\nIker Muñoz, 17 años, Mediapunta, diestro\nCD Demo · Juvenil A · 176 cm · 68 kg'}
          className="min-h-32"
        />

        {ficha && (
          <div className="space-y-1 rounded-xl border border-border p-3 text-sm">
            <div><span className="text-muted-foreground">Nombre:</span> {ficha.name || '—'}</div>
            <div className="text-muted-foreground">
              {[ficha.pos, ficha.age ? `${ficha.age} años` : null, ficha.foot, ficha.club, ficha.category]
                .filter(Boolean)
                .join(' · ') || 'Sin más datos'}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={analyze} disabled={!text.trim() || analyzing}>
            {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles />} Analizar
          </Button>
          <Button onClick={createFromFicha} disabled={!ficha?.name || create.isPending}>
            {create.isPending && <Loader2 className="animate-spin" />} Crear jugador
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
