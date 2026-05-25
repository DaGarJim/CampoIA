/** Tipos de dominio de CAMPO (mapean tablas Supabase del proyecto). */

export type Role = 'coach' | 'player';

export type PlayerStatus = 'available' | 'risk' | 'injured' | 'unavailable';

export interface Player {
  id: string;
  coach_id: string;
  auth_user_id: string | null;
  name: string;
  club: string | null;
  position: string | null;
  status: PlayerStatus | null;
  photo_url: string | null;
  birth_date: string | null;
  created_at: string;
}

export type MatchResult = 'win' | 'draw' | 'loss' | null;

export interface Match {
  id: string;
  coach_id: string;
  player_id: string;
  date: string;
  rival: string | null;
  result: string | null;
  minutes: number | null;
  called: boolean | null;
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
