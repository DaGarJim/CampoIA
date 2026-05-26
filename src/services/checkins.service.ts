import { supabase } from '@/lib/supabase';
import type { CheckIn } from '@/types/domain';

/** Lee los check-ins visibles para el coach (RLS los limita a sus jugadores). */
export async function listCheckins(): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CheckIn[];
}
