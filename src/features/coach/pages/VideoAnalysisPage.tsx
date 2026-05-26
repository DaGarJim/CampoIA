import { useState } from 'react';
import { ExternalLink, Loader2, MessageSquareText, Plus, Share2, Upload } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePlayers } from '@/hooks/usePlayers';
import { useCreateVideoAnalysis, useVideoAnalysis } from '@/hooks/useVideos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { uploadVideo } from '@/lib/storage';
import { toast } from '@/lib/toast';
import { notifyHaptic } from '@/lib/haptics';
import type { VideoType } from '@/types/domain';

function AddAnalysisDialog() {
  const { user } = useAuth();
  const { data: players } = usePlayers();
  const create = useCreateVideoAnalysis();
  const [open, setOpen] = useState(false);
  const [playerId, setPlayerId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<VideoType>('link');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!playerId || !title.trim() || !user) {
      toast.error('Elige jugador y título.');
      return;
    }
    setBusy(true);
    try {
      let finalUrl = url.trim();
      if (type === 'file') {
        if (!file) {
          toast.error('Selecciona un archivo.');
          setBusy(false);
          return;
        }
        finalUrl = await uploadVideo(user.id, file);
      }
      await create.mutateAsync({ player_id: playerId, title: title.trim(), video_url: finalUrl, video_type: type, comment });
      await notifyHaptic();
      toast.success('Análisis compartido con el jugador');
      setPlayerId('');
      setTitle('');
      setUrl('');
      setFile(null);
      setComment('');
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={(players?.length ?? 0) === 0}>
          <Plus /> Nuevo análisis
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo análisis de vídeo</DialogTitle>
          <DialogDescription>Comparte un vídeo y tus observaciones con un jugador.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="va-player">Jugador</Label>
            <Select id="va-player" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
              <option value="" disabled>
                Elige…
              </option>
              {(players ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="va-title">Título</Label>
            <Input id="va-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Análisis del partido vs Las Rozas" />
          </div>
          <div>
            <Label htmlFor="va-type">Tipo</Label>
            <Select id="va-type" value={type} onChange={(e) => setType(e.target.value as VideoType)}>
              <option value="link">Enlace (YouTube, Drive, Vimeo…)</option>
              <option value="file">Subir archivo</option>
            </Select>
          </div>
          {type === 'link' ? (
            <div>
              <Label htmlFor="va-url">Enlace</Label>
              <Input id="va-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>
          ) : (
            <div>
              <Label htmlFor="va-file">Archivo</Label>
              <Input id="va-file" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          )}
          <div>
            <Label htmlFor="va-comment">Comentario</Label>
            <Textarea id="va-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Observaciones para el jugador…" />
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Share2 />} Compartir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function VideoAnalysisPage() {
  const { data: analyses, isLoading } = useVideoAnalysis();
  const { data: players } = usePlayers();
  const nameOf = (id: string | null) => players?.find((p) => p.id === id)?.name ?? '—';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Vídeo análisis</h1>
          <p className="text-sm text-muted-foreground">Análisis en vídeo compartidos con tus jugadores.</p>
        </div>
        <AddAnalysisDialog />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Card key={i} className="h-20 animate-pulse" />)}
        </div>
      ) : (analyses?.length ?? 0) === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <MessageSquareText className="size-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Sin análisis todavía</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Comparte el primer análisis de vídeo con un jugador.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {(analyses ?? []).map((a) => (
            <Card key={a.id} className="flex items-start gap-3 p-3.5">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <MessageSquareText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">
                  {nameOf(a.player_id)} · {new Date(a.created_at).toLocaleDateString('es-ES')}
                </div>
                {a.comment && <p className="mt-1 text-sm text-foreground/90">{a.comment}</p>}
              </div>
              {a.video_url && (
                <Button asChild variant="outline" size="sm">
                  <a href={a.video_url} target="_blank" rel="noopener noreferrer">
                    {a.video_type === 'file' ? <Upload className="size-4" /> : <ExternalLink className="size-4" />} Abrir
                  </a>
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
