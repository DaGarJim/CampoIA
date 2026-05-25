import { Download, FileText } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePlayers } from '@/hooks/usePlayers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/utils';
import { generatePlayerReport } from '@/lib/pdf';

export function ReportsPage() {
  const { name } = useAuth();
  const { data: players, isLoading } = usePlayers();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Informes</h1>
        <p className="text-sm text-muted-foreground">Genera un PDF con la ficha de cada jugador.</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (players?.length ?? 0) === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Sin jugadores</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Añade jugadores para poder generar informes.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {(players ?? []).map((p) => (
            <Card key={p.id} className="flex items-center gap-3 p-3.5">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">
                {initials(p.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">{p.pos ?? '—'} · score {p.score ?? '—'}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => void generatePlayerReport(p, name || 'Coach')}>
                <Download /> PDF
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
