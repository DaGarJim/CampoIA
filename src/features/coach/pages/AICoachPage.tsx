import { useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { askCoachAI } from '@/services/ai.service';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatTurn {
  role: 'user' | 'ai';
  text: string;
}

export function AICoachPage() {
  const [turns, setTurns] = useState<ChatTurn[]>([
    { role: 'ai', text: 'Hola, soy tu IA Coach. Pregúntame sobre la carga, el ánimo o las decisiones de tus jugadores.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setError(null);
    setTurns((t) => [...t, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const reply = await askCoachAI(q);
      setTurns((t) => [...t, { role: 'ai', text: reply || '(sin respuesta)' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-2xl flex-col">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h1 className="font-display text-2xl font-extrabold tracking-tight">IA Coach</h1>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
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
              {t.text}
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

        <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregunta a tu IA Coach…" />
          <Button type="submit" size="icon" disabled={!input.trim() || loading}>
            <Send />
          </Button>
        </form>
      </Card>
    </div>
  );
}
