import { supabase } from '@/lib/supabase';
import type { Assessment } from '@/types/domain';

export type AssessmentInput = Partial<
  Pick<
    Assessment,
    | 'height_cm'
    | 'weight_kg'
    | 'vertical_jump'
    | 'horizontal_jump'
    | 'flexibility_cmj'
    | 'rm_squat'
    | 'rm_deadlift'
    | 'rm_bench'
    | 'notes'
  >
> & { date?: string };

export async function listAssessments(playerId: string): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('player_id', playerId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Assessment[];
}

/** Guarda una instantánea de la valoración física en el histórico. */
export async function createAssessment(
  coachId: string,
  playerId: string,
  input: AssessmentInput,
): Promise<void> {
  const { error } = await supabase.from('assessments').insert({
    coach_id: coachId,
    player_id: playerId,
    date: input.date ?? new Date().toISOString().slice(0, 10),
    height_cm: input.height_cm ?? null,
    weight_kg: input.weight_kg ?? null,
    vertical_jump: input.vertical_jump ?? null,
    horizontal_jump: input.horizontal_jump ?? null,
    flexibility_cmj: input.flexibility_cmj ?? null,
    rm_squat: input.rm_squat ?? null,
    rm_deadlift: input.rm_deadlift ?? null,
    rm_bench: input.rm_bench ?? null,
    notes: input.notes?.trim() || null,
  });
  if (error) throw error;
}
