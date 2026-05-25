import { useAuth } from '@/features/auth/AuthProvider';
import { Card } from '@/components/ui/card';
import { initials } from '@/lib/utils';

export function PlayerHomePage() {
  const { name } = useAuth();
  const firstName = name?.split(' ')[0] || 'Jugador';

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3 pt-1">
        <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display font-extrabold text-white">
          {initials(name)}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Hola,</div>
          <div className="font-display text-lg font-extrabold leading-none">{firstName}</div>
        </div>
      </header>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5b21b6] to-[#0891b2] p-5 text-white shadow-xl">
        <div className="pointer-events-none absolute -bottom-10 -right-6 size-40 rounded-full bg-white/10 blur-2xl" />
        <span className="inline-flex rounded-full bg-black/25 px-3 py-1 text-xs font-extrabold">🔥 Tu arena</span>
        <p className="mt-3 font-display text-xl font-extrabold leading-tight">
          Pronto: misiones, XP y tu progreso
        </p>
      </div>

      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Tu portal de jugador está en construcción.</p>
      </Card>
    </div>
  );
}
