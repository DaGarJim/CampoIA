import { useState } from 'react';
import { Send } from 'lucide-react';
import { useMyPlayer, usePlayerThread, useSendPlayerMessage } from '@/hooks/usePlayerData';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

export function PlayerChatPage() {
  const { data: player, isLoading } = useMyPlayer();
  const thread = usePlayerThread(player?.coach_id, player?.id);
  const send = useSendPlayerMessage(player?.coach_id, player?.id);
  const [text, setText] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || send.isPending) return;
    setText('');
    try {
      await send.mutateAsync(body);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar.');
    }
  }

  if (isLoading) return <Skeleton className="h-[60vh] rounded-2xl" />;

  if (!player) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Tu entrenador aún no ha vinculado tu ficha.</p>
      </Card>
    );
  }

  const messages = thread.data ?? [];

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col">
      <h1 className="mb-3 font-display text-2xl font-extrabold tracking-tight">Mi coach</h1>
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Escribe a tu entrenador. Las dudas también entrenan.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  m.sender === 'player'
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
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mensaje a tu coach…" />
          <Button type="submit" size="icon" disabled={!text.trim() || send.isPending}>
            <Send />
          </Button>
        </form>
      </Card>
    </div>
  );
}
