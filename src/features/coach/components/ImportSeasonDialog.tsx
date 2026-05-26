import { useState, type ReactNode } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
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
import { useCreateMatch } from '@/hooks/useMatches';
import { importSeason, type ParsedSeasonMatch } from '@/services/ai.service';
import { notifyHaptic } from '@/lib/haptics';
import { toast } from '@/lib/toast';

export function ImportSeasonDialog({ playerId, trigger }: { playerId: string; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedSeasonMatch[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const create = useCreateMatch();

  async function analyze() {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const matches = await importSeason(text);
      setParsed(matches);
      if (matches.length === 0) toast.warning('No se detectaron partidos. Añade más contexto.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo analizar el texto.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function importAll() {
    if (!parsed?.length) return;
    try {
      for (const m of parsed) {
        await create.mutateAsync({
          player_id: playerId,
          date: m.date || new Date().toISOString().slice(0, 10),
          rival: m.rival || 'Rival',
          result: m.result || undefined,
          mins: m.mins || undefined,
          role: m.role || undefined,
        });
      }
      await notifyHaptic();
      toast.success(`${parsed.length} partidos importados`);
      setParsed(null);
      setText('');
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudieron importar.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar temporada con IA</DialogTitle>
          <DialogDescription>
            Pega una tabla de calendario (BeSoccer, FutFox, federación, Excel). Cuanto más contexto, mejor.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Ej:\n12/09/2025 vs Las Rozas 2-1 Titular 90\n19/09/2025 vs Pozuelo 0-0 Suplente 65'}
          className="min-h-36"
        />

        {parsed && parsed.length > 0 && (
          <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-border p-2">
            {parsed.map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{m.date || '—'}</span>
                <span className="flex-1 truncate">vs {m.rival || '—'}</span>
                <span className="font-semibold">{m.result || '—'}</span>
                <span className="text-muted-foreground">{m.role || '—'}</span>
                <span className="text-muted-foreground">{m.mins || 0}'</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={analyze} disabled={!text.trim() || analyzing}>
            {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles />} Analizar con IA
          </Button>
          <Button onClick={importAll} disabled={!parsed?.length || create.isPending}>
            {create.isPending && <Loader2 className="animate-spin" />} Importar {parsed?.length ? `(${parsed.length})` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
