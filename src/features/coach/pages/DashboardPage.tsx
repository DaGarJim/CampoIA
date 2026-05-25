import { ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const KPIS = [
  { label: 'Jugadores', value: '—' },
  { label: 'Carga semanal', value: '—' },
  { label: 'Partidos', value: '—' },
  { label: 'En riesgo', value: '—' },
];

export function DashboardPage() {
  const { name } = useAuth();
  const firstName = name?.split(' ')[0] || 'Coach';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight lg:text-3xl">Hola, {firstName}</h1>
        <p className="text-sm text-muted-foreground">Tu centro de mando del día.</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#5b21b6] to-[#0e7490] p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-14 size-56 rounded-full bg-cyan-400/30 blur-2xl" />
        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest">
          Decisión del día
        </span>
        <p className="relative mt-3 max-w-lg font-display text-lg font-bold leading-snug">
          Conecta tus datos y CAMPO propondrá la mejor decisión para cada jugador.
        </p>
        <Button variant="secondary" className="mt-4 border-0 bg-white text-[#1e1b4b] hover:bg-white/90">
          Empezar <ArrowRight />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label} className="relative overflow-hidden p-4">
            <div className="absolute inset-y-0 left-0 w-1 bg-primary/80" />
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</div>
            <div className="mt-2 font-display text-3xl font-extrabold tracking-tight">{k.value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6 text-center">
        <h3 className="font-display text-lg font-bold">Aún no hay jugadores</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Añade tu primer jugador para registrar partidos, entrenos y métricas.
        </p>
        <Button className="mt-4">
          <UserPlus /> Añadir jugador
        </Button>
      </Card>
    </div>
  );
}
