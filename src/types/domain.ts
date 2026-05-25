/** Tipos de dominio de CAMPO (mapean tablas Supabase del proyecto). */

export type Role = 'coach' | 'player';

export type PlayerStatus = 'available' | 'risk' | 'injured' | 'unavailable';
export type Trend = 'up' | 'down' | 'eq';

export interface Player {
  id: string;
  coach_id: string;
  auth_user_id: string | null;
  name: string;
  pos: string | null;
  pos_group: string | null;
  age: number | null;
  foot: string | null;
  club: string | null;
  category: string | null;
  status: PlayerStatus;
  trend: Trend | null;
  score: number | null;
  adherence: number | null;
  mins: number | null;
  callups: number | null;
  played: number | null;
  scored: number | null;
  assisted: number | null;
  sleep: number | null;
  tag: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  photo_url: string | null;
  created_at: string;
}

/** Campos requeridos para crear un jugador (el resto recibe valores por defecto). */
export interface CreatePlayerInput {
  name: string;
  pos: string;
  age: number;
  foot: string;
  club?: string;
  category?: string;
  status: PlayerStatus;
}

export interface Match {
  id: string;
  coach_id: string;
  player_id: string;
  date: string;
  rival: string | null;
  result: string | null;
  mins: number | null;
  called: string | null;
  role: string | null;
  notes: string | null;
  created_at: string;
}

export type TaskPriority = 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  coach_id: string;
  player_id: string | null;
  description: string;
  type: string | null;
  priority: TaskPriority | null;
  due_date: string | null;
  done: boolean | null;
  created_at: string;
}

export interface TrainingSession {
  id: string;
  coach_id: string;
  player_id: string | null;
  type: string | null;
  duration: number | null;
  date: string;
  rpe: number | null;
  goal: string | null;
  notes: string | null;
  created_at: string;
}

export interface CheckIn {
  id: string;
  player_id: string;
  date: string;
  mood: number | null;
  energy: number | null;
  sleep_hours: number | null;
  notes: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  coach_id: string;
  player_id: string;
  sender: Role;
  body: string;
  created_at: string;
  read: boolean | null;
}
