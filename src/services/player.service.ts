import { supabase } from '@/lib/supabase';
import type { CheckIn, Match, Player, Task } from '@/types/domain';

export async function getMyPlayer(authUserId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('auth_user_id', authUserId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Player | null) ?? null;
}

export async function listMyTasks(playerId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function listMyMatches(playerId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('player_id', playerId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Match[];
}

export async function listMyCheckins(playerId: string): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('player_id', playerId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CheckIn[];
}

export interface CreateCheckinInput {
  player_id: string;
  date: string;
  mood?: number;
  energy?: number;
  sleep_hours?: number;
  notes?: string;
}

export async function createCheckin(input: CreateCheckinInput): Promise<void> {
  const { error } = await supabase.from('check_ins').insert({
    player_id: input.player_id,
    date: input.date,
    mood: input.mood ?? null,
    energy: input.energy ?? null,
    sleep_hours: input.sleep_hours ?? null,
    notes: input.notes?.trim() || null,
  });
  if (error) throw error;
}
