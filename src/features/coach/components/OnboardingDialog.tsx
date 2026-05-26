import { useEffect, useState } from 'react';
import { Loader2, Rocket, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSeedDemoPlayers } from '@/hooks/usePlayers';
import { toast } from '@/lib/toast';

const SEEN_KEY = 'campo_onboarding_seen';

/** Se muestra una vez cuando el coach no tiene jugadores. */
export function OnboardingDialog({ hasPlayers }: { hasPlayers: boolean }) {
  const seed = useSeedDemoPlayers();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasPlayers && !localStorage.getItem(SEEN_KEY)) setOpen(true);
  }, [hasPlayers]);

  function dismiss() {
    localStorage.setItem(SEEN_KEY, '1');
    setOpen(false);
  }

  async function loadDemo() {
    try {
      const n = await seed.mutateAsync();
      toast.success(n > 0 ? `${n} jugadores demo cargados` : 'Ya tienes jugadores');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudieron cargar.');
    } finally {
      dismiss();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : dismiss())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bienvenido a CAMPO</DialogTitle>
          <DialogDescription>Empieza tu cartera de jugadores. Tres pasos: crea, invita y comparte informes.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={dismiss} className="h-auto flex-col items-start gap-1 p-4 text-left">
            <Rocket className="size-5 text-primary" />
            <span className="font-display text-sm font-bold">Empezar de cero</span>
            <span className="text-xs text-muted-foreground">Añade tus jugadores reales.</span>
          </Button>
          <Button onClick={loadDemo} disabled={seed.isPending} className="h-auto flex-col items-start gap-1 p-4 text-left">
            {seed.isPending ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
            <span className="font-display text-sm font-bold">Cargar jugadores demo</span>
            <span className="text-xs opacity-90">Explora con datos de ejemplo.</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
