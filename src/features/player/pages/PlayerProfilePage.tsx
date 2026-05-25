import { LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMyPlayer } from '@/hooks/usePlayerData';
import { signOut } from '@/services/auth.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/utils';
import { levelOf } from '../lib/gamify';

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export function PlayerProfilePage() {
  const { name, user } = useAuth();
  const { data: player, isLoading } = useMyPlayer();

  return (
    <div className="space-y-5 pt-1">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Tu perfil</h1>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : (
        <Card className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-[#5b21b6] to-[#0891b2] p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="grid size-14 place-items-center rounded-2xl bg-white/20 font-display text-xl font-extrabold">
                {initials(player?.name ?? name)}
              </div>
              <div>
                <div className="font-display text-xl font-extrabold">{player?.name ?? name}</div>
                <div className="text-sm text-white/80">
                  {(player?.pos ?? '—') + ' · Nivel ' + levelOf(player)}
                </div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border px-5">
            <Row label="Club" value={player?.club ?? '—'} />
            <Row label="Edad" value={player?.age ?? '—'} />
            <Row label="Pie" value={player?.foot ?? '—'} />
            <Row label="Score" value={player?.score ?? '—'} />
            <Row label="Adherencia" value={`${player?.adherence ?? 0}%`} />
            <Row label="Email" value={user?.email ?? '—'} />
          </div>
        </Card>
      )}

      <Button variant="destructive" className="w-full" onClick={() => void signOut()}>
        <LogOut /> Cerrar sesión
      </Button>
    </div>
  );
}
