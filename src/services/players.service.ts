import { supabase } from '@/lib/supabase';
import type { CreatePlayerInput, Player, PlayerStatus } from '@/types/domain';

export async function listPlayers(coachId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Player[];
}

export async function createPlayer(coachId: string, input: CreatePlayerInput): Promise<Player> {
  const payload = {
    coach_id: coachId,
    name: input.name,
    pos: input.pos,
    pos_group: input.pos,
    age: input.age,
    foot: input.foot,
    club: input.club || null,
    category: input.category || null,
    status: input.status,
    trend: 'eq',
    adherence: 0,
    mins: 0,
    callups: 0,
    played: 0,
    scored: 0,
    assisted: 0,
    tag: input.status === 'injured' ? 'Volviendo de lesión' : null,
  };
  const { data, error } = await supabase.from('players').insert(payload).select().single();
  if (error) throw error;
  return data as Player;
}

export async function updatePlayerStatus(id: string, status: PlayerStatus): Promise<void> {
  const { error } = await supabase.from('players').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}
