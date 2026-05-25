import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerCard } from '../components/PlayerCard';
import { AddPlayerDialog } from '../components/AddPlayerDialog';

export function PlayersPage() {
  const { data: players, isLoading, isError } = usePlayers();
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const filtered = (players ?? []).filter(
    (p) => p.name.toLowerCase().includes(term) || (p.club ?? '').toLowerCase().includes(term),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Jugadores</h1>
          <p className="text-sm text-muted-foreground">{players?.length ?? 0} en tu plantilla</p>
        </div>
        <AddPlayerDialog />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar jugador o club…"
          className="pl-9"
        />
      </div>

      {isError && (
        <Card className="p-6 text-center text-sm text-destructive">
          No se pudieron cargar los jugadores. Revisa tu conexión.
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Users className="size-6" />
          </div>
          <h3 className="font-display text-lg font-bold">
            {players && players.length > 0 ? 'Sin resultados' : 'Aún no hay jugadores'}
          </h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            {players && players.length > 0
              ? 'Prueba con otra búsqueda.'
              : 'Añade tu primer jugador para empezar a registrar su evolución.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}
