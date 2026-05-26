import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerCard } from '../components/PlayerCard';
import { AddPlayerDialog } from '../components/AddPlayerDialog';
import { ImportFichaDialog } from '../components/ImportFichaDialog';
import { POSITIONS, STATUS_META } from '../lib/player-ui';
import type { PlayerStatus } from '@/types/domain';

const STATUS_FILTERS: Array<{ value: 'all' | PlayerStatus; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: STATUS_META.available.label },
  { value: 'risk', label: STATUS_META.risk.label },
  { value: 'injured', label: STATUS_META.injured.label },
  { value: 'unavailable', label: STATUS_META.unavailable.label },
];

export function PlayersPage() {
  const navigate = useNavigate();
  const { data: players, isLoading, isError } = usePlayers();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | PlayerStatus>('all');
  const [pos, setPos] = useState<string>('all');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (players ?? []).filter((p) => {
      const matchesTerm =
        !term || p.name.toLowerCase().includes(term) || (p.club ?? '').toLowerCase().includes(term);
      const matchesStatus = status === 'all' || p.status === status;
      const matchesPos = pos === 'all' || p.pos === pos;
      return matchesTerm && matchesStatus && matchesPos;
    });
  }, [players, query, status, pos]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Jugadores</h1>
          <p className="text-sm text-muted-foreground">{players?.length ?? 0} en tu plantilla</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportFichaDialog />
          <AddPlayerDialog />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jugador o club…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'all' | PlayerStatus)}
          className="w-40"
          aria-label="Filtrar por estado"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
        <Select value={pos} onChange={(e) => setPos(e.target.value)} className="w-44" aria-label="Filtrar por posición">
          <option value="all">Todas las posiciones</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
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
              ? 'Prueba con otra búsqueda o filtro.'
              : 'Añade tu primer jugador para empezar a registrar su evolución.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PlayerCard key={p.id} player={p} onClick={() => navigate(`/players/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
