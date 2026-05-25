import { supabase } from '@/lib/supabase';
import type { Task, TaskPriority } from '@/types/domain';

export interface CreateTaskInput {
  player_id: string;
  description: string;
  type?: string;
  priority?: TaskPriority;
  due_date?: string;
}

export async function listTasks(coachId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function createTask(coachId: string, input: CreateTaskInput): Promise<Task> {
  const payload = {
    coach_id: coachId,
    player_id: input.player_id,
    description: input.description.trim(),
    type: input.type ?? 'Técnica',
    priority: input.priority ?? 'normal',
    due_date: input.due_date || null,
    done: false,
  };
  const { data, error } = await supabase.from('tasks').insert(payload).select().single();
  if (error) throw error;
  return data as Task;
}

export async function setTaskDone(id: string, done: boolean): Promise<void> {
  const { error } = await supabase.from('tasks').update({ done }).eq('id', id);
  if (error) throw error;
}

/**
 * Completar tarea desde el portal del jugador. Usa la RPC `set_my_task_done`,
 * que solo permite cambiar el flag `done` de tareas del propio jugador (no se
 * permite actualizar campos arbitrarios ni tareas ajenas, ver RLS/RPC).
 */
export async function setMyTaskDone(id: string, done: boolean): Promise<void> {
  const { data, error } = await supabase.rpc('set_my_task_done', {
    task_id: id,
    is_done: done,
  });
  if (error) throw error;
  const result = data as { success?: boolean; error?: string } | null;
  if (result?.success === false) throw new Error(result.error ?? 'No se pudo actualizar la tarea.');
}
