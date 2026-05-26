import { useRef, useState } from 'react';
import { Clapperboard, Film, Loader2, Plus, Star, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCreateVideo, useDeleteVideo, useUpdateVideoHighlights, useVideos } from '@/hooks/useVideos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { Highlight, Video } from '@/types/domain';

function AddVideoDialog() {
  const { user } = useAuth();
  const create = useCreateVideo();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !user) return;
    setBusy(true);
    try {
      const url = await uploadVideo(user.id, file);
      await create.mutateAsync({ title: title.trim() || file.name, url, size_mb: +(file.size / (1024 * 1024)).toFixed(1) });
      await notifyHaptic();
      toast.success('Vídeo subido');
      setTitle('');
      setFile(null);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo subir el vídeo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Subir vídeo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir vídeo</DialogTitle>
          <DialogDescription>MP4, MOV o WebM. Máximo 50 MB.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="v-title">Título</Label>
            <Input id="v-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Análisis vs Las Rozas" />
          </div>
          <div>
            <Label htmlFor="v-file">Archivo</Label>
            <Input id="v-file" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={!file || busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Upload />} Subir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VideoPlayerDialog({ video }: { video: Video }) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveHl = useUpdateVideoHighlights();
  const [highlights, setHighlights] = useState<Highlight[]>(video.highlights ?? []);
  const [label, setLabel] = useState('');

  async function addHighlight() {
    const t = Math.floor(videoRef.current?.currentTime ?? 0);
    const next = [...highlights, { t, label: label.trim() || `Min ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}` }].sort((a, b) => a.t - b.t);
    setHighlights(next);
    setLabel('');
    try {
      await saveHl.mutateAsync({ id: video.id, highlights: next });
      toast.success('Highlight guardado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar.');
    }
  }

  function seek(t: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      void videoRef.current.play();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Film className="size-4" /> Abrir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{video.title}</DialogTitle>
        </DialogHeader>
        <video ref={videoRef} src={video.url} controls className="w-full rounded-xl bg-black">
          <track kind="captions" />
        </video>
        <div className="flex gap-2">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Etiqueta del momento (opcional)" />
          <Button onClick={addHighlight} disabled={saveHl.isPending}>
            <Star /> Marcar
          </Button>
        </div>
        {highlights.length > 0 && (
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {highlights.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => seek(h.t)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary"
              >
                <Star className="size-3.5 text-warning" />
                <span className="font-mono text-xs text-muted-foreground">
                  {Math.floor(h.t / 60)}:{String(h.t % 60).padStart(2, '0')}
                </span>
                <span className="flex-1 truncate">{h.label}</span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function VideoPage() {
  const { data: videos, isLoading } = useVideos();
  const del = useDeleteVideo();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Vídeo</h1>
          <p className="text-sm text-muted-foreground">Biblioteca de vídeos con highlights.</p>
        </div>
        <AddVideoDialog />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Card key={i} className="h-40 animate-pulse" />)}
        </div>
      ) : (videos?.length ?? 0) === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Film className="size-6" />
          </div>
          <h3 className="font-display text-lg font-bold">Sin vídeos</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">Sube tu primer vídeo para marcar highlights.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(videos ?? []).map((v) => (
            <Card key={v.id} className="group relative overflow-hidden p-4">
              <div className="mb-3 grid h-24 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                <Clapperboard className="size-8" />
              </div>
              <div className="truncate font-display text-sm font-bold">{v.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {new Date(v.created_at).toLocaleDateString('es-ES')} · {v.size_mb ?? '—'} MB · {(v.highlights ?? []).length} highlights
              </div>
              <div className="mt-3 flex items-center gap-2">
                <VideoPlayerDialog video={v} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto text-destructive"
                  aria-label="Eliminar"
                  onClick={() => {
                    if (confirm(`¿Eliminar "${v.title}"?`)) del.mutate(v.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
