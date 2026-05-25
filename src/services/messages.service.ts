import { supabase } from '@/lib/supabase';
import type { Message } from '@/types/domain';

export async function listThread(coachId: string, playerId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('coach_id', coachId)
    .eq('player_id', playerId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(coachId: string, playerId: string, body: string): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    coach_id: coachId,
    player_id: playerId,
    sender: 'coach',
    body: body.trim(),
    read: false,
  });
  if (error) throw error;
}
