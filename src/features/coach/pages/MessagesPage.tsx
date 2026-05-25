import { useState } from 'react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { useSendMessage, useThread } from '@/hooks/useMessages';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, initials } from '@/lib/utils';
import { tapHaptic } from '@/lib/haptics';

export function MessagesPage() {
  const { data: players } = usePlayers();
  const [selected, setSelected] = useState<string | null>(null);
  const thread = useThread(selected);
  const send = useSendMessage(selected);
  const [text, setText] = useState('');
  const selectedPlayer = players?.find((p) => p.id === selected);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !selected) return;
    send.mutate(body);
    setText('');
    void tapHaptic();
  }

  return (
    <div className="grid h-[calc(100dvh-9rem)] gap-4 lg:grid-cols-[300px_1fr]">
      <Card className={cn('overflow-y-auto p-2', selected && 'hidden lg:block')}>
        {(players?.length ?? 0) === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Sin jugadores todavía.</div>
        ) : (
          (players ?? []).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors',
                selected === p.id ? 'bg-primary/10' : 'hover:bg-secondary',
              )}
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold">
                {initials(p.name)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">{p.club ?? '—'}</div>
              </div>
            </button>
          ))
        )}
      </Card>

      <Card className={cn('flex flex-col overflow-hidden', !selected && 'hidden lg:flex')}>
        {!selected ? (
          <div className="grid flex-1 place-items-center p-6 text-center">
            <div>
              <MessageSquare className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Elige una conversación.</p>
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-2 border-b border-border p-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelected(null)}>
                <ArrowLeft />
              </Button>
              <div className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold">
                {initials(selectedPlayer?.name ?? '?')}
              </div>
              <span className="font-semibold">{selectedPlayer?.name}</span>
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {thread.isLoading ? (
                <p className="text-center text-xs text-muted-foreground">Cargando…</p>
              ) : (thread.data?.length ?? 0) === 0 ? (
                <p className="text-center text-xs text-muted-foreground">Aún no hay mensajes.</p>
              ) : (
                (thread.data ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
                      m.sender === 'coach'
                        ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground'
                        : 'mr-auto rounded-bl-sm bg-secondary text-foreground',
                    )}
                  >
                    {m.body}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje…" />
              <Button type="submit" size="icon" disabled={!text.trim() || send.isPending}>
                <Send />
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
