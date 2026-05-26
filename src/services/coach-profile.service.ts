import { supabase } from '@/lib/supabase';
import type { CoachProfile } from '@/types/domain';

export async function getCoachProfile(userId: string): Promise<CoachProfile | null> {
  const { data, error } = await supabase
    .from('coach_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as CoachProfile | null) ?? null;
}

export type CoachProfilePatch = Partial<Omit<CoachProfile, 'user_id' | 'created_at' | 'updated_at'>>;

export async function upsertCoachProfile(userId: string, patch: CoachProfilePatch): Promise<CoachProfile> {
  const { data, error } = await supabase
    .from('coach_profiles')
    .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data as CoachProfile;
}
