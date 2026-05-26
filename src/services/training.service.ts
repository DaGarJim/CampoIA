import { supabase } from '@/lib/supabase';
import type { TrainingSession } from '@/types/domain';

export interface CreateTrainingInput {
  player_id: string;
  date: string;
  type: string;
  duration: number;
  rpe?: number;
  goal?: string;
  notes?: string;
}

export async function listTrainings(coachId: string): Promise<TrainingSession[]> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('coach_id', coachId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrainingSession[];
}

export async function createTraining(
  coachId: string,
  input: CreateTrainingInput,
): Promise<TrainingSession> {
  const payload = {
    coach_id: coachId,
    player_id: input.player_id,
    date: input.date,
    type: input.type,
    duration: input.duration,
    rpe: input.rpe ?? 7,
    goal: input.goal?.trim() || null,
    notes: input.notes?.trim() || null,
  };
  const { data, error } = await supabase.from('training_sessions').insert(payload).select().single();
  if (error) throw error;
  return data as TrainingSession;
}

export async function listMyTrainings(playerId: string): Promise<TrainingSession[]> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('player_id', playerId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrainingSession[];
}

/** El jugador marca una sesión propia como completada (RPC RLS-safe). */
export async function setMyTrainingDone(sessionId: string, done: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_my_training_done', { session_id: sessionId, is_done: done });
  if (error) throw error;
}
