import type { QueryClient } from '@tanstack/react-query';
import type { Session, User } from '@supabase/supabase-js';
import type {
  CheckIn,
  CoachProfile,
  Match,
  Message,
  Player,
  Role,
  Task,
  TrainingSession,
  Video,
  VideoAnalysis,
} from '@/types/domain';

/**
 * Modo demo para validación visual local (capturas/e2e) SIN backend ni login real.
 * Se activa SOLO si VITE_DEMO === 'coach' | 'player' en tiempo de build. El build de
 * producción (.env.production) no define VITE_DEMO, así que queda desactivado.
 * Nunca debe usarse para bypassar auth en producción: ver demo.test.ts.
 */
export function demoRole(): Role | null {
  // Seguridad en producción: el modo demo SOLO es posible en builds marcadas
  // explícitamente con VITE_DEMO en build-time. Sin ese flag → siempre null.
  const v = import.meta.env.VITE_DEMO;
  const enabled = v === '1' || v === 'coach' || v === 'player';
  if (!enabled) return null;

  // La activación requiere una señal de runtime (?demo= en la URL o localStorage),
  // de modo que una build demo siga mostrando el login real por defecto y los
  // tests E2E puedan alternar coach/player sin reconstruir.
  let signal: string | null = null;
  try {
    signal = new URLSearchParams(window.location.search).get('demo') ?? window.localStorage.getItem('campo_demo');
  } catch {
    signal = null;
  }
  if (signal === 'coach' || signal === 'player') {
    try {
      window.localStorage.setItem('campo_demo', signal);
    } catch {
      /* contexto sin localStorage */
    }
    return signal;
  }
  return null;
}

export function isDemo(): boolean {
  return demoRole() !== null;
}

export const DEMO_COACH_ID = '00000000-0000-4000-8000-000000000001';
export const DEMO_PLAYER_AUTH_ID = '00000000-0000-4000-8000-000000000010';
const DEMO_PLAYER_ID = '00000000-0000-4000-8000-000000000100';

function todayMinus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function player(partial: Partial<Player> & { id: string; name: string }): Player {
  return {
    coach_id: DEMO_COACH_ID,
    auth_user_id: null,
    invite_code: 'CAMPO' + partial.id.slice(-1).toUpperCase(),
    pos: 'Mediocentro',
    pos_group: 'Medio',
    age: 17,
    foot: 'Derecho',
    club: 'CD Demo',
    category: 'Juvenil A',
    status: 'available',
    trend: 'up',
    score: 72,
    adherence: 80,
    mins: 540,
    callups: 8,
    played: 7,
    scored: 3,
    assisted: 2,
    sleep: 7.5,
    rpe: 6.5,
    tag: null,
    player_email: null,
    height_cm: 176,
    weight_kg: 68,
    vertical_jump: 42,
    horizontal_jump: 215,
    flexibility_cmj: 34,
    rm_squat: 90,
    rm_deadlift: 110,
    rm_bench: 60,
    ai_attributes: null,
    ai_metrics: null,
    strength: null,
    improve: null,
    demo: true,
    photo_url: null,
    created_at: new Date().toISOString(),
    ...partial,
  };
}

export const demoPlayers: Player[] = [
  player({
    id: DEMO_PLAYER_ID,
    name: 'Iker Muñoz',
    pos: 'Mediapunta',
    score: 84,
    status: 'available',
    trend: 'up',
    auth_user_id: DEMO_PLAYER_AUTH_ID,
    ai_attributes: { tecnica: 86, tactica: 80, fisico: 74, mental: 82, velocidad: 88, lectura: 79 },
    ai_metrics: { mejora: 82, competitividad: 90, descanso: 70, trabajo: 85, ejercicio: 78 },
    strength: 'Desborde y llegada desde segunda línea; gran capacidad de aceleración.',
    improve: 'Mejorar la toma de decisiones en el último tercio bajo presión.',
  }),
  player({ id: 'p2', name: 'Lucía Sanz', pos: 'Extremo', score: 77, adherence: 91, status: 'available' }),
  player({ id: 'p3', name: 'Marco Ferreira', pos: 'Defensa central', score: 63, adherence: 54, status: 'risk', trend: 'down', tag: 'Riesgo sobrecarga' }),
  player({ id: 'p4', name: 'Adrián Gil', pos: 'Delantero', score: 58, adherence: 40, status: 'injured', trend: 'down', tag: 'Volviendo de lesión' }),
];

const demoMatches: Match[] = [
  { id: 'm1', coach_id: DEMO_COACH_ID, player_id: DEMO_PLAYER_ID, date: todayMinus(3), rival: 'Las Rozas CF', result: '2-1', mins: 90, called: 'yes', role: 'Titular', fatigue: 6, notes: 'Gran partido, 1 gol.', created_at: todayMinus(3) },
  { id: 'm2', coach_id: DEMO_COACH_ID, player_id: 'p2', date: todayMinus(10), rival: 'Pozuelo', result: '0-0', mins: 65, called: 'yes', role: 'Titular', fatigue: 5, notes: null, created_at: todayMinus(10) },
  { id: 'm3', coach_id: DEMO_COACH_ID, player_id: 'p3', date: todayMinus(17), rival: 'Alcobendas', result: '1-3', mins: 45, called: 'yes', role: 'Suplente', fatigue: 8, notes: null, created_at: todayMinus(17) },
];

const demoTasks: Task[] = [
  { id: 't1', coach_id: DEMO_COACH_ID, player_id: DEMO_PLAYER_ID, description: 'Sesión de finalización con pie no dominante', type: 'Técnica', priority: 'high', due_date: todayMinus(-2), done: false, created_at: todayMinus(1) },
  { id: 't2', coach_id: DEMO_COACH_ID, player_id: DEMO_PLAYER_ID, description: 'Movilidad de cadera 15 min', type: 'Física', priority: 'normal', due_date: todayMinus(-1), done: true, created_at: todayMinus(2) },
  { id: 't3', coach_id: DEMO_COACH_ID, player_id: 'p3', description: 'Trabajo de descarga (RPE bajo)', type: 'Recuperación', priority: 'urgent', due_date: todayMinus(-1), done: false, created_at: todayMinus(1) },
];

const demoTrainings: TrainingSession[] = [
  { id: 'tr1', coach_id: DEMO_COACH_ID, player_id: DEMO_PLAYER_ID, type: 'Técnica', duration: 75, date: todayMinus(2), rpe: 6, goal: 'Control orientado', notes: null, completed: true, completed_at: todayMinus(2), created_at: todayMinus(2) },
  { id: 'tr2', coach_id: DEMO_COACH_ID, player_id: 'p2', type: 'Velocidad', duration: 50, date: todayMinus(4), rpe: 8, goal: 'Sprints 30m', notes: null, completed: false, completed_at: null, created_at: todayMinus(4) },
  { id: 'tr3', coach_id: DEMO_COACH_ID, player_id: DEMO_PLAYER_ID, type: 'Movilidad', duration: 30, date: todayMinus(0), rpe: 4, goal: 'Cadera y tobillo', notes: null, completed: false, completed_at: null, created_at: todayMinus(0) },
];

const demoMessages: Message[] = [
  { id: 'msg1', coach_id: DEMO_COACH_ID, player_id: DEMO_PLAYER_ID, sender: 'coach', body: '¡Buen partido el domingo! Repasamos el vídeo esta semana.', created_at: todayMinus(2), read: true },
  { id: 'msg2', coach_id: DEMO_COACH_ID, player_id: DEMO_PLAYER_ID, sender: 'player', body: 'Gracias mister, lo veo y te comento.', created_at: todayMinus(2), read: true },
];

const demoCheckins: CheckIn[] = [
  { id: 'c1', player_id: DEMO_PLAYER_ID, date: todayMinus(1), mood: 4, energy: 4, sleep_hours: 8, pain_level: 0, pain_zone: null, notes: 'Bien', created_at: todayMinus(1) },
  { id: 'c2', player_id: DEMO_PLAYER_ID, date: todayMinus(2), mood: 3, energy: 3, sleep_hours: 6.5, pain_level: 2, pain_zone: 'gemelo derecho', notes: null, created_at: todayMinus(2) },
];

const demoVideos: Video[] = [
  { id: 'v1', coach_id: DEMO_COACH_ID, player_id: DEMO_PLAYER_ID, match_id: null, title: 'Entreno finalización', url: '', size_mb: 24.5, notes: 'Trabajo de definición', highlights: [{ t: 45, label: 'Buen control' }, { t: 132, label: 'Definición' }], created_at: todayMinus(2) },
];

const demoVideoAnalysis: VideoAnalysis[] = [
  { id: 'va1', coach_id: DEMO_COACH_ID, player_id: DEMO_PLAYER_ID, title: 'Análisis vs Las Rozas', video_url: 'https://example.com/video', video_type: 'link', comment: 'Fíjate en los desmarques al espacio en el min 12.', highlights: [], created_at: todayMinus(1) },
];

const demoPlayer = demoPlayers[0];

const demoCoachProfile: CoachProfile = {
  user_id: DEMO_COACH_ID,
  name: 'Entrenador Demo',
  phone: '600 000 000',
  specialty: 'completo',
  experience_years: 8,
  certifications: 'UEFA A · Preparador físico',
  club: 'CD Demo',
  web: 'campo.app',
  brand_name: 'CAMPO Performance',
  brand_color: '#7c3aed',
  brand_slogan: 'Datos que entrenan decisiones',
  logo_url: null,
  report_footer: 'CAMPO Performance · campo.app · 600 000 000',
  report_disclaimer: 'Informe orientativo de uso interno.',
  prefs: { language: 'es', date_format: 'dmy', rpe_scale: '1-10' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function buildDemoAuthState() {
  const role = demoRole();
  const isCoach = role === 'coach';
  const id = isCoach ? DEMO_COACH_ID : DEMO_PLAYER_AUTH_ID;
  const email = isCoach ? 'coach@demo.campo' : 'jugador@demo.campo';
  const user = { id, email } as unknown as User;
  const session = { user, access_token: 'demo', refresh_token: 'demo' } as unknown as Session;
  return {
    status: 'authenticated' as const,
    session,
    user,
    role: role as Role,
    name: isCoach ? 'Entrenador Demo' : 'Iker Muñoz',
  };
}

/** Pre-puebla la caché de TanStack Query con fixtures bajo las claves reales de los hooks. */
export function seedDemoData(qc: QueryClient) {
  const role = demoRole();
  if (role === 'coach') {
    qc.setQueryData(['players', DEMO_COACH_ID], demoPlayers);
    qc.setQueryData(['matches', DEMO_COACH_ID], demoMatches);
    qc.setQueryData(['tasks', DEMO_COACH_ID], demoTasks);
    qc.setQueryData(['trainings', DEMO_COACH_ID], demoTrainings);
    qc.setQueryData(['messages', DEMO_COACH_ID, DEMO_PLAYER_ID], demoMessages);
    qc.setQueryData(['checkins', DEMO_COACH_ID], demoCheckins);
    qc.setQueryData(['videos', DEMO_COACH_ID], demoVideos);
    qc.setQueryData(['video-analysis', DEMO_COACH_ID], demoVideoAnalysis);
    qc.setQueryData(['coach-profile', DEMO_COACH_ID], demoCoachProfile);
  } else if (role === 'player') {
    qc.setQueryData(['my-player', DEMO_PLAYER_AUTH_ID], demoPlayer);
    qc.setQueryData(['my-tasks', DEMO_PLAYER_ID], demoTasks.filter((t) => t.player_id === DEMO_PLAYER_ID));
    qc.setQueryData(['my-matches', DEMO_PLAYER_ID], demoMatches.filter((m) => m.player_id === DEMO_PLAYER_ID));
    qc.setQueryData(['my-checkins', DEMO_PLAYER_ID], demoCheckins);
    qc.setQueryData(['my-trainings', DEMO_PLAYER_ID], demoTrainings.filter((t) => t.player_id === DEMO_PLAYER_ID));
    qc.setQueryData(['player-thread', DEMO_PLAYER_ID], demoMessages);
    qc.setQueryData(['my-video-analysis', DEMO_PLAYER_ID], demoVideoAnalysis);
  }
}
