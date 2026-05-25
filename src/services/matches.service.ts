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
