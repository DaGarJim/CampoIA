import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, initials } from '@/lib/utils';
import type { Player } from '@/types/domain';
import { STATUS_META, scoreColor } from '../lib/player-ui';

function Stat({ value, label }: { value: number | null; label: string }) {
  return (
    <div>
      <div className="font-display text-base font-extrabold">{value ?? 0}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

export function PlayerCard({ player, onClick }: { player: Player; onClick?: () => void }) {
  const meta = STATUS_META[player.status] ?? STATUS_META.available;
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent font-display text-base font-extrabold text-white">
          {player.photo_url ? (
            <img src={player.photo_url} alt={player.name} className="size-full object-cover" />
          ) : (
            initials(player.name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold">{player.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {(player.club || 'Sin club') + ' · ' + (player.pos || '—')}
          </div>
        </div>
        <div className={cn('text-right font-display text-2xl font-extrabold leading-none', scoreColor(player.score))}>
          {player.score ?? '—'}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-y border-border py-3 text-center">
        <Stat value={player.played} label="PJ" />
        <Stat value={player.scored} label="Goles" />
        <Stat value={player.assisted} label="Asist" />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Card>
  );
}
