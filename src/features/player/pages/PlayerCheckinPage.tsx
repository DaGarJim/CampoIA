import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCreateCheckin, useMyPlayer } from '@/hooks/usePlayerData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { notifyHaptic, tapHaptic } from '@/lib/haptics';

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

function Scale({ value, onChange, emojis }: { value: number; onChange: (v: number) => void; emojis?: string[] }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => {
            onChange(n);
            void tapHaptic();
          }}
          className={cn(
            'grid h-12 flex-1 place-items-center rounded-xl border text-lg font-bold transition-colors active:scale-95',
            value === n ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground',
          )}
        >
          {emojis ? emojis[n - 1] : n}
        </button>
      ))}
    </div>
  );
}

export function PlayerCheckinPage() {
  const { data: player } = useMyPlayer();
  const create = useCreateCheckin(player?.id);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState('8');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!player) return;
    await create.mutateAsync({
      date: new Date().toISOString().slice(0, 10),
      mood,
      energy,
      sleep_hours: Number(sleep) || undefined,
      notes: notes || undefined,
    });
    await notifyHaptic();
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <CheckCircle2 className="mx-auto mb-3 size-12 text-success" />
          <h2 className="font-display text-xl font-extrabold">¡Check-in guardado!</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tu entrenador lo verá en su panel.</p>
          <Button className="mt-5" onClick={() => setDone(false)}>
            Hacer otro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-1">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Check-in diario</h1>
        <p className="text-sm text-muted-foreground">¿Cómo te encuentras hoy?</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <Card className="space-y-4 p-4">
          <div>
            <Label>Ánimo</Label>
            <Scale value={mood} onChange={setMood} emojis={MOODS} />
          </div>
          <div>
            <Label>Energía</Label>
            <Scale value={energy} onChange={setEnergy} />
          </div>
          <div>
            <Label htmlFor="sleep">Horas de sueño</Label>
            <Input id="sleep" type="number" min={0} max={14} step="0.5" value={sleep} onChange={(e) => setSleep(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="¿Algo que contar?" />
          </div>
        </Card>

        {create.isError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            No se pudo guardar el check-in.
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={!player || create.isPending}>
          Guardar check-in
        </Button>
      </form>
    </div>
  );
}
