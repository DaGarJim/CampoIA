import { supabase } from '@/lib/supabase';
import type { CreatePlayerInput, Player, PlayerStatus, UpdatePlayerInput } from '@/types/domain';

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
    height_cm: input.height_cm ?? null,
    weight_kg: input.weight_kg ?? null,
    vertical_jump: input.vertical_jump ?? null,
    horizontal_jump: input.horizontal_jump ?? null,
    flexibility_cmj: input.flexibility_cmj ?? null,
    rm_squat: input.rm_squat ?? null,
    rm_deadlift: input.rm_deadlift ?? null,
    rm_bench: input.rm_bench ?? null,
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

/** Actualiza campos físicos/atributos/branding del jugador (Player Passport). */
export async function updatePlayer(id: string, patch: UpdatePlayerInput): Promise<Player> {
  const { data, error } = await supabase.from('players').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Player;
}

const DEMO_SEED: Array<Pick<Player, 'name' | 'pos' | 'age' | 'foot' | 'club' | 'status' | 'score' | 'adherence'>> = [
  { name: 'Iker Muñoz', pos: 'Mediapunta', age: 17, foot: 'Derecho', club: 'CD Demo', status: 'available', score: 84, adherence: 88 },
  { name: 'Lucía Sanz', pos: 'Extremo', age: 16, foot: 'Izquierdo', club: 'CD Demo', status: 'available', score: 77, adherence: 91 },
  { name: 'Marco Ferreira', pos: 'Defensa central', age: 18, foot: 'Derecho', club: 'CD Demo', status: 'risk', score: 63, adherence: 54 },
];

/** Carga jugadores de ejemplo (idempotente: no hace nada si el coach ya tiene fichas). */
export async function seedDemoPlayers(coachId: string): Promise<number> {
  const existing = await listPlayers(coachId);
  if (existing.length > 0) return 0;
  const rows = DEMO_SEED.map((p) => ({ ...p, coach_id: coachId, pos_group: p.pos, demo: true, trend: 'eq' as const }));
  const { error } = await supabase.from('players').insert(rows);
  if (error) throw error;
  return rows.length;
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}
