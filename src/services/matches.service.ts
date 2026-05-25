import { supabase } from '@/lib/supabase';
import type { Match } from '@/types/domain';

export async function listMatches(coachId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('coach_id', coachId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Match[];
}

export interface CreateMatchInput {
  player_id: string;
  date: string;
  rival: string;
  result?: string;
  mins?: number;
  called?: string;
  role?: string;
  notes?: string;
}

export async function createMatch(coachId: string, input: CreateMatchInput): Promise<Match> {
  const payload = {
    coach_id: coachId,
    player_id: input.player_id,
    date: input.date,
    rival: input.rival,
    result: input.result || null,
    mins: input.mins ?? 0,
    called: input.called ?? 'yes',
    role: input.role ?? null,
    notes: input.notes?.trim() || null,
  };
  const { data, error } = await supabase.from('matches').insert(payload).select().single();
  if (error) throw error;
  return data as Match;
}
