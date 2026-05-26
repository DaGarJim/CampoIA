import { useRef } from 'react';
import { Camera, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMyPlayer, useSetMyPhoto } from '@/hooks/usePlayerData';
import { signOut } from '@/services/auth.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/utils';
import { uploadMyPhoto } from '@/lib/storage';
import { toast } from '@/lib/toast';
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
  const setPhoto = useSetMyPhoto();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadMyPhoto(user.id, file);
      await setPhoto.mutateAsync(url);
      toast.success('Foto actualizada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo subir la foto.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-5 pt-1">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Tu perfil</h1>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : (
        <Card className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-[#5b21b6] to-[#0891b2] p-5 text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/20 font-display text-xl font-extrabold"
                aria-label="Cambiar foto"
              >
                {player?.photo_url ? (
                  <img src={player.photo_url} alt={player.name ?? ''} className="size-full object-cover" />
                ) : (
                  initials(player?.name ?? name)
                )}
                <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-5" />
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
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
