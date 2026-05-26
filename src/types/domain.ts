/** Tipos de dominio de CAMPO (mapean tablas Supabase del proyecto). */

export type Role = 'coach' | 'player';

export type PlayerStatus = 'available' | 'risk' | 'injured' | 'unavailable';
export type Trend = 'up' | 'down' | 'eq';

/** Atributos técnicos estimados (0-99), editables a mano o generados por IA. */
export interface AIAttributes {
  tecnica: number;
  tactica: number;
  fisico: number;
  mental: number;
  velocidad: number;
  lectura: number;
}

/** Métricas porcentuales (0-100) generadas por IA para el pasaporte. */
export interface AIMetrics {
  mejora: number;
  competitividad: number;
  descanso: number;
  trabajo: number;
  ejercicio: number;
}

export interface Player {
  id: string;
  coach_id: string;
  auth_user_id: string | null;
  invite_code: string | null;
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
  vertical_jump: number | null;
  horizontal_jump: number | null;
  flexibility_cmj: number | null;
  rm_squat: number | null;
  rm_deadlift: number | null;
  rm_bench: number | null;
  ai_attributes: AIAttributes | null;
  ai_metrics: AIMetrics | null;
  strength: string | null;
  improve: string | null;
  demo: boolean | null;
  photo_url: string | null;
  created_at: string;
}

/** Campos para crear un jugador. Los básicos son obligatorios; el resto opcional. */
export interface CreatePlayerInput {
  name: string;
  pos: string;
  age: number;
  foot: string;
  club?: string;
  category?: string;
  status: PlayerStatus;
  height_cm?: number;
  weight_kg?: number;
  vertical_jump?: number;
  horizontal_jump?: number;
  flexibility_cmj?: number;
  rm_squat?: number;
  rm_deadlift?: number;
  rm_bench?: number;
}

/** Campos físicos y de atributos editables del jugador (Player Passport). */
export interface UpdatePlayerInput {
  height_cm?: number | null;
  weight_kg?: number | null;
  vertical_jump?: number | null;
  horizontal_jump?: number | null;
  flexibility_cmj?: number | null;
  rm_squat?: number | null;
  rm_deadlift?: number | null;
  rm_bench?: number | null;
  ai_attributes?: AIAttributes | null;
  ai_metrics?: AIMetrics | null;
  strength?: string | null;
  improve?: string | null;
  score?: number | null;
  photo_url?: string | null;
  category?: string | null;
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
  completed: boolean | null;
  completed_at: string | null;
  created_at: string;
}

export interface CheckIn {
  id: string;
  player_id: string;
  date: string;
  mood: number | null;
  energy: number | null;
  sleep_hours: number | null;
  pain_level: number | null;
  pain_zone: string | null;
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

export type VideoType = 'link' | 'file';

export interface Highlight {
  t: number;
  label: string;
}

export interface Video {
  id: string;
  coach_id: string;
  title: string;
  url: string;
  size_mb: number | null;
  highlights: Highlight[];
  created_at: string;
}

export interface VideoAnalysis {
  id: string;
  coach_id: string;
  player_id: string | null;
  title: string;
  video_url: string | null;
  video_type: VideoType;
  comment: string | null;
  highlights: Highlight[];
  created_at: string;
}

/** Preferencias del entrenador (idioma, formato, entrenamiento). */
export interface CoachPrefs {
  language?: string;
  date_format?: string;
  week_start?: string;
  session_types?: string;
  player_tags?: string;
  rpe_scale?: string;
}

/** Perfil + branding de informes + preferencias (tabla coach_profiles). */
export interface CoachProfile {
  user_id: string;
  name: string | null;
  phone: string | null;
  specialty: string | null;
  experience_years: number | null;
  certifications: string | null;
  club: string | null;
  web: string | null;
  brand_name: string | null;
  brand_color: string | null;
  brand_slogan: string | null;
  logo_url: string | null;
  report_footer: string | null;
  report_disclaimer: string | null;
  prefs: CoachPrefs;
  created_at: string;
  updated_at: string;
}
