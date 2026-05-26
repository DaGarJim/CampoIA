import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarPlus,
  Camera,
  Dumbbell,
  FileDown,
  ListPlus,
  Loader2,
  MessageSquare,
  Ruler,
  Share2,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  Upload,
} from 'lucide-react';
import { usePlayers, useUpdatePlayer, useUpdatePlayerStatus, useDeletePlayer } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import { useCoachProfile } from '@/hooks/useCoachProfile';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddTaskDialog } from '../components/AddTaskDialog';
import { AddMatchDialog } from '../components/AddMatchDialog';
import { AddTrainingDialog } from '../components/AddTrainingDialog';
import { EditAttributesDialog } from '../components/EditAttributesDialog';
import { EditPhysicalDialog } from '../components/EditPhysicalDialog';
import { ImportSeasonDialog } from '../components/ImportSeasonDialog';
import { STATUS_META, scoreColor } from '../lib/player-ui';
import { cn, initials } from '@/lib/utils';
import { generateAIMetrics } from '@/services/ai.service';
import { uploadPlayerPhoto } from '@/lib/storage';
import { generatePlayerDossier } from '@/lib/pdf';
import { toast } from '@/lib/toast';
import type { AIAttributes, AIMetrics, PlayerStatus } from '@/types/domain';

const ATTR_LABELS: Record<keyof AIAttributes, string> = {
  tecnica: 'Técnica',
  tactica: 'Táctica',
  fisico: 'Físico',
  mental: 'Mental',
  velocidad: 'Velocidad',
  lectura: 'Lectura',
};

const METRIC_LABELS: Record<keyof AIMetrics, string> = {
  mejora: 'Mejora',
  competitividad: 'Competitividad',
  descanso: 'Descanso',
  trabajo: 'Trabajo',
  ejercicio: 'Ejercicio',
};

function Bar({ label, value, max = 99 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-primary' : 'bg-warning';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-display font-bold">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: typeof Camera; label: string; onClick?: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="justify-start">
      <Icon className="size-4" /> {label}
    </Button>
  );
}

export function PlayerPassportPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: players, isLoading } = usePlayers();
  const { data: matches } = useMatches();
  const { data: profile } = useCoachProfile();
  const updateStatus = useUpdatePlayerStatus();
  const updatePlayer = useUpdatePlayer();
  const del = useDeletePlayer();
  const fileRef = useRef<HTMLInputElement>(null);
  const [genLoading, setGenLoading] = useState(false);

  const player = players?.find((p) => p.id === id);
  const playerMatches = (matches ?? []).filter((m) => m.player_id === id);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!player) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-muted-foreground">Jugador no encontrado.</p>
        <Button asChild className="mt-4">
          <Link to="/players">Volver a jugadores</Link>
        </Button>
      </Card>
    );
  }

  const meta = STATUS_META[player.status] ?? STATUS_META.available;

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !player) return;
    try {
      const url = await uploadPlayerPhoto(player.coach_id, player.id, file);
      await updatePlayer.mutateAsync({ id: player.id, patch: { photo_url: url } });
      toast.success('Foto actualizada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo subir la foto.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function genMetrics() {
    if (!player) return;
    setGenLoading(true);
    try {
      const r = await generateAIMetrics(player);
      await updatePlayer.mutateAsync({
        id: player.id,
        patch: { ai_attributes: r.ai_attributes, ai_metrics: r.ai_metrics, strength: r.strength, improve: r.improve },
      });
      toast.success('Métricas IA generadas');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudieron generar las métricas.');
    } finally {
      setGenLoading(false);
    }
  }

  function copyInvite() {
    if (!player?.invite_code) {
      toast.warning('Este jugador aún no tiene código de invitación.');
      return;
    }
    void navigator.clipboard?.writeText(player.invite_code);
    toast.success(`Código ${player.invite_code} copiado`);
  }

  async function remove() {
    if (!player || player.demo) return;
    if (!confirm(`¿Eliminar a ${player.name}? Esta acción no se puede deshacer.`)) return;
    await del.mutateAsync(player.id);
    toast.success('Jugador eliminado');
    navigate('/players');
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/players">
          <ArrowLeft className="size-4" /> Jugadores
        </Link>
      </Button>

      {/* Header */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            {player.photo_url && <AvatarImage src={player.photo_url} alt={player.name} />}
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-lg text-white">
              {initials(player.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">{player.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[player.pos, player.category, player.club, player.age ? `${player.age} años` : null, player.foot]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge variant={meta.variant} className="cursor-pointer">
                    {meta.label} ▾
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(Object.keys(STATUS_META) as PlayerStatus[]).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => updateStatus.mutate({ id: player.id, status: s })}
                    >
                      {STATUS_META[s].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {player.tag && <Badge variant="muted">{player.tag}</Badge>}
            </div>
          </div>
          <div className={cn('text-right font-display text-4xl font-extrabold leading-none', scoreColor(player.score))}>
            {player.score ?? '—'}
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <ActionButton icon={MessageSquare} label="Mensaje" onClick={() => navigate('/messages')} />
          <AddTaskDialog
            defaultPlayerId={player.id}
            trigger={<Button variant="outline" size="sm" className="justify-start"><ListPlus className="size-4" /> Tarea</Button>}
          />
          <AddMatchDialog
            defaultPlayerId={player.id}
            trigger={<Button variant="outline" size="sm" className="justify-start"><CalendarPlus className="size-4" /> Partido</Button>}
          />
          <AddTrainingDialog
            defaultPlayerId={player.id}
            trigger={<Button variant="outline" size="sm" className="justify-start"><Dumbbell className="size-4" /> Entreno</Button>}
          />
          <EditAttributesDialog
            player={player}
            trigger={<Button variant="outline" size="sm" className="justify-start"><SlidersHorizontal className="size-4" /> Atributos</Button>}
          />
          <EditPhysicalDialog
            player={player}
            trigger={<Button variant="outline" size="sm" className="justify-start"><Ruler className="size-4" /> Físico</Button>}
          />
          <ActionButton icon={Camera} label="Foto" onClick={() => fileRef.current?.click()} />
          <Button variant="outline" size="sm" onClick={genMetrics} disabled={genLoading} className="justify-start">
            {genLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Métricas IA
          </Button>
          <ActionButton icon={Share2} label="Invitar" onClick={copyInvite} />
          <ActionButton icon={FileDown} label="PDF" onClick={() => generatePlayerDossier(player, profile)} />
          <ImportSeasonDialog
            playerId={player.id}
            trigger={<Button variant="outline" size="sm" className="justify-start"><Upload className="size-4" /> Importar temporada</Button>}
          />
          {!player.demo && (
            <Button variant="outline" size="sm" onClick={remove} className="justify-start text-destructive">
              <Trash2 className="size-4" /> Eliminar
            </Button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="attrs">
        <TabsList>
          <TabsTrigger value="attrs">Atributos</TabsTrigger>
          <TabsTrigger value="physical">Físico</TabsTrigger>
          <TabsTrigger value="metrics">Métricas IA</TabsTrigger>
          <TabsTrigger value="competitive">Competición</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="attrs">
          <Card className="p-5">
            {player.ai_attributes ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(ATTR_LABELS) as Array<keyof AIAttributes>).map((k) => (
                  <Bar key={k} label={ATTR_LABELS[k]} value={player.ai_attributes![k]} />
                ))}
              </div>
            ) : (
              <EmptyHint text="Aún no hay atributos. Edítalos a mano o genera métricas con IA." />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="physical">
          <Card className="grid gap-3 p-5 sm:grid-cols-2">
            <Row label="Altura" value={player.height_cm ? `${player.height_cm} cm` : '—'} />
            <Row label="Peso" value={player.weight_kg ? `${player.weight_kg} kg` : '—'} />
            <Row label="Salto vertical" value={player.vertical_jump ? `${player.vertical_jump} cm` : '—'} />
            <Row label="Salto horizontal" value={player.horizontal_jump ? `${player.horizontal_jump} cm` : '—'} />
            <Row label="CMJ" value={player.flexibility_cmj ? `${player.flexibility_cmj} cm` : '—'} />
            <Row label="RM Sentadilla" value={player.rm_squat ? `${player.rm_squat} kg` : '—'} />
            <Row label="RM Peso muerto" value={player.rm_deadlift ? `${player.rm_deadlift} kg` : '—'} />
            <Row label="RM Press banca" value={player.rm_bench ? `${player.rm_bench} kg` : '—'} />
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card className="p-5">
            {player.ai_metrics ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(METRIC_LABELS) as Array<keyof AIMetrics>).map((k) => (
                  <Bar key={k} label={METRIC_LABELS[k]} value={player.ai_metrics![k]} max={100} />
                ))}
              </div>
            ) : (
              <EmptyHint text="Genera métricas con IA para ver mejora, competitividad, descanso, trabajo y ejercicio." />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="competitive">
          <Card className="p-5">
            <div className="grid grid-cols-3 gap-2 border-b border-border pb-4 text-center">
              <Stat value={player.mins ?? 0} label="Minutos" />
              <Stat value={player.callups ?? 0} label="Convocatorias" />
              <Stat value={player.scored ?? 0} label="Goles" />
            </div>
            <div className="mt-4 space-y-2">
              {playerMatches.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">{m.date}</span>
                  <span className="flex-1 truncate">vs {m.rival ?? '—'}</span>
                  <span className="font-semibold">{m.result ?? '—'}</span>
                  <span className="text-xs text-muted-foreground">{m.role ?? '—'} · {m.mins ?? 0}'</span>
                </div>
              ))}
              {playerMatches.length === 0 && <EmptyHint text="Sin partidos registrados." />}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          <div className="space-y-3">
            <Card className="border-l-4 border-l-success p-4">
              <h3 className="font-display text-sm font-bold text-success">Fortaleza</h3>
              <p className="mt-1 text-sm text-foreground">{player.strength || 'Genera métricas IA para obtener el análisis.'}</p>
            </Card>
            <Card className="border-l-4 border-l-warning p-4">
              <h3 className="font-display text-sm font-bold text-warning">Área de mejora</h3>
              <p className="mt-1 text-sm text-foreground">{player.improve || 'Genera métricas IA para obtener el análisis.'}</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-display text-xl font-extrabold">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="py-4 text-center text-sm text-muted-foreground">{text}</p>;
}
