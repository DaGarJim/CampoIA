import { useMemo, useState } from 'react';
import { Copy, Download, FileText, History, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePlayers } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import { useTrainings } from '@/hooks/useTrainings';
import { useCoachProfile } from '@/hooks/useCoachProfile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { buildCoachContext, generateReport, type ReportType } from '@/services/ai.service';
import { generateReportPdf } from '@/lib/pdf';
import { renderMarkdown } from '@/lib/markdown';
import { toast } from '@/lib/toast';

const REPORT_TYPES: Array<{ key: ReportType; title: string; desc: string }> = [
  { key: 'weekly', title: 'Informe semanal', desc: 'Resumen completo de la semana' },
  { key: 'parents', title: 'Informe para padres', desc: 'Tono positivo, orientado al desarrollo' },
  { key: 'club', title: 'Informe para el club', desc: 'Análisis técnico-físico-táctico' },
  { key: 'match', title: 'Informe post-partido', desc: 'Análisis del último partido' },
  { key: 'monthly', title: 'Informe mensual', desc: 'KPIs y tendencias del mes' },
  { key: 'agent', title: 'Informe para representante', desc: 'Datos de mercado y rendimiento' },
];

const PERIODS: Array<{ value: string; label: string; days: number | null }> = [
  { value: 'week', label: 'Esta semana', days: 7 },
  { value: 'month', label: 'Este mes', days: 30 },
  { value: 'quarter', label: 'Último trimestre', days: 90 },
  { value: 'all', label: 'Toda la historia', days: null },
];

interface HistoryItem {
  type: ReportType;
  typeLabel: string;
  playerName: string;
  period: string;
  ts: number;
}

const HISTORY_KEY = 'campo_report_history';
const CACHE_TTL = 60 * 60 * 1000; // 1h

function readHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as HistoryItem[];
  } catch {
    return [];
  }
}

export function ReportsPage() {
  const { name } = useAuth();
  const { data: players, isLoading } = usePlayers();
  const { data: matches } = useMatches();
  const { data: trainings } = useTrainings();
  const { data: profile } = useCoachProfile();

  const [playerId, setPlayerId] = useState<'all' | string>('all');
  const [period, setPeriod] = useState('month');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<{ type: ReportType; typeLabel: string; playerName: string; period: string; markdown: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => readHistory());

  const list = players ?? [];
  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? 'Este mes';
  const playerName = playerId === 'all' ? `Toda la cartera (${list.length})` : list.find((p) => p.id === playerId)?.name ?? '—';

  const context = useMemo(() => {
    const all = players ?? [];
    const days = PERIODS.find((p) => p.value === period)?.days ?? null;
    const cutoff = days ? Date.now() - days * 86400000 : 0;
    const inPeriod = (date: string) => !cutoff || new Date(date).getTime() >= cutoff;
    const subset = playerId === 'all' ? all : all.filter((p) => p.id === playerId);
    const ms = (matches ?? []).filter((m) => (playerId === 'all' || m.player_id === playerId) && inPeriod(m.date));
    const ts = (trainings ?? []).filter((t) => (playerId === 'all' || t.player_id === playerId) && inPeriod(t.date));
    return buildCoachContext(subset, ms, ts);
  }, [players, matches, trainings, playerId, period]);

  async function generate(type: ReportType, typeLabel: string) {
    setOpen(true);
    setLoading(true);
    setCurrent(null);
    const cacheKey = `campo_report_${type}_${playerId}_${period}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      let markdown = '';
      if (cached) {
        const parsed = JSON.parse(cached) as { t: number; content: string };
        if (Date.now() - parsed.t < CACHE_TTL) markdown = parsed.content;
      }
      if (!markdown) {
        markdown = await generateReport({ type, playerName, period: periodLabel, context, coachName: name || 'CAMPO' });
        localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), content: markdown }));
      }
      setCurrent({ type, typeLabel, playerName, period: periodLabel, markdown });
      const entry: HistoryItem = { type, typeLabel, playerName, period: periodLabel, ts: Date.now() };
      const next = [entry, ...readHistory()].slice(0, 8);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      setHistory(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo generar el informe.');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!current) return;
    void navigator.clipboard?.writeText(current.markdown);
    toast.success('Informe copiado');
  }

  function download() {
    if (!current) return;
    void generateReportPdf(current.markdown, profile, {
      typeLabel: current.typeLabel,
      playerName: current.playerName,
      period: current.period,
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Informes</h1>
        <p className="text-sm text-muted-foreground">Informes profesionales con IA, listos para compartir.</p>
      </div>

      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1">
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">Jugador</label>
          <Select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="all">Toda la cartera ({list.length})</option>
            {list.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-40 flex-1">
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">Periodo</label>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => void generate(r.key, r.title)}
              disabled={list.length === 0}
              className="group rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="mb-2 grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                <FileText className="size-5" />
              </div>
              <div className="font-display text-sm font-bold">{r.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{r.desc}</div>
            </button>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <History className="size-3.5" /> Historial reciente
          </h2>
          <Card className="divide-y divide-border">
            {history.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => void generate(h.type, h.typeLabel)}
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary"
              >
                <FileText className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{h.typeLabel}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {h.playerName} · {h.period} · {new Date(h.ts).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </button>
            ))}
          </Card>
        </section>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{current?.typeLabel ?? 'Generando informe…'}</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" /> Generando con IA…
            </div>
          ) : current ? (
            <>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-secondary px-2.5 py-1">{current.playerName}</span>
                <span className="rounded-full bg-secondary px-2.5 py-1">{current.period}</span>
              </div>
              <div
                className="max-h-[55vh] overflow-y-auto rounded-xl border border-border p-4 text-sm leading-relaxed [&_h1]:mb-2 [&_h1]:font-display [&_h1]:text-lg [&_h1]:font-extrabold [&_h2]:mb-1 [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-2 [&_strong]:font-bold"
                dangerouslySetInnerHTML={renderMarkdown(current.markdown)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={copy}>
                  <Copy /> Copiar
                </Button>
                <Button onClick={download}>
                  <Download /> Descargar PDF
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
