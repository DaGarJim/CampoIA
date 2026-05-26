import { useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { askCoachAI, buildCoachContext, type ChatTurn } from '@/services/ai.service';
import { usePlayers } from '@/hooks/usePlayers';
import { useMatches } from '@/hooks/useMatches';
import { useTrainings } from '@/hooks/useTrainings';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { renderMarkdown } from '@/lib/markdown';

const QUICK_PROMPTS = [
  '¿Qué jugador necesita más atención hoy y por qué?',
  'Dame un plan semanal completo para todos mis jugadores',
  'Analiza la evolución de todos mis jugadores',
  '¿Qué jugadores están listos para subir de exigencia?',
  'Genera un informe semanal profesional para compartir',
];

const USAGE_LIMIT = 50;

export function AICoachPage() {
  const { data: players } = usePlayers();
  const { data: matches } = useMatches();
  const { data: trainings } = useTrainings();
  const [turns, setTurns] = useState<ChatTurn[]>([
    { role: 'ai', text: 'Hola, soy tu **IA Coach**. Tengo el contexto de tu plantilla. Pregúntame sobre carga, ánimo o decisiones.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState(0);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setInput('');
    setError(null);
    const history = turns;
    setTurns((t) => [...t, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const context = buildCoachContext(players ?? [], matches ?? [], trainings ?? []);
      const reply = await askCoachAI(q, context, history);
      setTurns((t) => [...t, { role: 'ai', text: reply || '(sin respuesta)' }]);
      setUsed((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid h-[calc(100dvh-9rem)] max-w-5xl gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex min-h-0 flex-col">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h1 className="font-display text-2xl font-extrabold tracking-tight">IA Coach</h1>
          <span className="ml-2 text-xs text-muted-foreground">
            {(players?.length ?? 0)} jugadores · contexto real
          </span>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {turns.map((t, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  t.role === 'user'
                    ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground'
                    : 'mr-auto rounded-bl-sm bg-secondary text-foreground',
                )}
              >
                {t.role === 'ai' ? (
                  <div
                    className="prose-campo space-y-1 [&_h1]:font-display [&_h1]:text-base [&_h2]:font-display [&_h2]:text-sm [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-bold"
                    dangerouslySetInnerHTML={renderMarkdown(t.text)}
                  />
                ) : (
                  t.text
                )}
              </div>
            ))}
            {loading && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Pensando…
              </div>
            )}
            {error && (
              <div className="mr-auto max-w-[85%] rounded-2xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(input);
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregunta a tu IA Coach…" />
            <Button type="submit" size="icon" disabled={!input.trim() || loading}>
              <Send />
            </Button>
          </form>
        </Card>
      </div>

      <div className="hidden flex-col gap-3 lg:flex">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Accesos rápidos
        </h2>
        <div className="space-y-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => void ask(p)}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-card p-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-secondary disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        <Card className="mt-auto p-4">
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="font-semibold text-muted-foreground">Uso de IA</span>
            <span className="font-display font-bold">{used} / {USAGE_LIMIT}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${Math.min(100, (used / USAGE_LIMIT) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Plan Pro · análisis con contexto real</p>
        </Card>
      </div>
    </div>
  );
}
