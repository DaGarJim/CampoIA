// db-smoke.mjs — pruebas funcionales contra Supabase real (sin mocks).
// Cubre el flujo entero: coach signup → crear jugador → trigger invite_code →
// RLS coach/player → RPCs (set_my_task_done, set_my_training_done, set_my_photo)
// → coach_profiles → videos / video_analysis → assessments → check_in con
// trigger de auto-status → Edge Function `ai-coach` (todos los modos, fallback).
//
// Uso: node scripts/db-smoke.mjs  (Node 22 + .env.production cargado).
// La limpieza de los auth.users de prueba se hace por separado via MCP.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.production', 'utf8')
    .split('\n')
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const SUPA_URL = env.VITE_SUPABASE_URL;
const SUPA_KEY = env.VITE_SUPABASE_ANON_KEY;
if (!SUPA_URL || !SUPA_KEY) {
  console.error('Faltan VITE_SUPABASE_URL/ANON_KEY en .env.production');
  process.exit(1);
}

const TS = Date.now();
// Supabase rechaza TLDs reservados (.test, .example, .invalid, .local).
// Uso un dominio público válido; los emails no necesitan existir para signUp.
const COACH_EMAIL = `smoke-coach-${TS}@campoia.app`;
const PLAYER_EMAIL = `smoke-player-${TS}@campoia.app`;
const PASSWORD = 'SmokeTest!2025-CAMPO';

const results = [];
async function run(label, fn) {
  try {
    const out = await fn();
    results.push({ label, ok: true });
    console.log(`✅ ${label}`);
    return out;
  } catch (e) {
    const msg = e?.message ?? String(e);
    results.push({ label, ok: false, err: msg });
    console.log(`❌ ${label} — ${msg}`);
    return null;
  }
}
const must = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const coach = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });
const player = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });

console.log(`\n→ Smoke contra ${SUPA_URL}\n`);

// --- Auth + provisioning ---------------------------------------------------
let coachId, playerAuthId, playerRow;
await run('Coach: signUp + session inmediata', async () => {
  const { data, error } = await coach.auth.signUp({
    email: COACH_EMAIL,
    password: PASSWORD,
    options: { data: { name: 'Smoke Coach', role: 'coach' } },
  });
  if (error) throw error;
  must(data.session, 'signUp no devolvió sesión (¿email confirmation activado?)');
  coachId = data.user.id;
});

if (!coachId) {
  console.log('\n⛔ Sin sesión de coach — abortando smoke (no tiene sentido continuar).');
  process.exit(1);
}

await run('Coach: provisioning vía RPC register_coach', async () => {
  const { error } = await coach.rpc('register_coach');
  if (error) throw error;
});

await run('Coach: user_roles contiene coach', async () => {
  const { data, error } = await coach.from('user_roles').select('role').eq('user_id', coachId);
  if (error) throw error;
  must(
    data.some((r) => r.role === 'coach'),
    'No se concedió el rol coach',
  );
});

// --- CRUD coach: jugador (testea trigger generate_invite_code) -------------
let playerId;
await run('Coach: INSERT player (dispara trigger invite_code) — fix 0005', async () => {
  const { data, error } = await coach
    .from('players')
    .insert({
      coach_id: coachId,
      name: 'Smoke Player',
      pos: 'Mediocentro',
      pos_group: 'Mediocentro',
      age: 18,
      foot: 'Derecho',
      status: 'available',
    })
    .select()
    .single();
  if (error) throw error;
  playerId = data.id;
  playerRow = data;
  must(/^[A-F0-9]{6}$/.test(data.invite_code), `invite_code mal formado: ${data.invite_code}`);
});

// --- Player signup + claim invite ------------------------------------------
await run('Player: signUp + session', async () => {
  const { data, error } = await player.auth.signUp({
    email: PLAYER_EMAIL,
    password: PASSWORD,
    options: { data: { name: 'Smoke Jugador', role: 'player', invite_code: playerRow.invite_code } },
  });
  if (error) throw error;
  must(data.session, 'player signUp no devolvió sesión');
  playerAuthId = data.user.id;
});

await run('Player: RPC claim_invite_code vincula la ficha', async () => {
  const { data, error } = await player.rpc('claim_invite_code', { code: playerRow.invite_code });
  if (error) throw error;
  must(data?.success === true, `claim_invite_code success=false: ${JSON.stringify(data)}`);
});

await run('Player: user_roles contiene player', async () => {
  const { data, error } = await player.from('user_roles').select('role').eq('user_id', playerAuthId);
  if (error) throw error;
  must(data.some((r) => r.role === 'player'), 'no se concedió rol player');
});

// --- CRUD coach: match / training / task / message -------------------------
let matchId, trainingId, taskId;
await run('Coach: INSERT match', async () => {
  const { data, error } = await coach
    .from('matches')
    .insert({ coach_id: coachId, player_id: playerId, date: '2026-05-20', rival: 'Smoke FC', result: '2-1', mins: 88, role: 'Titular', called: 'yes' })
    .select()
    .single();
  if (error) throw error;
  matchId = data.id;
});

await run('Coach: INSERT training', async () => {
  const { data, error } = await coach
    .from('training_sessions')
    .insert({ coach_id: coachId, player_id: playerId, date: '2026-05-21', type: 'Técnica', duration: 60, rpe: 6, goal: 'Control orientado' })
    .select()
    .single();
  if (error) throw error;
  trainingId = data.id;
});

await run('Coach: INSERT task', async () => {
  const { data, error } = await coach
    .from('tasks')
    .insert({ coach_id: coachId, player_id: playerId, description: 'Smoke task', type: 'Técnica', priority: 'normal' })
    .select()
    .single();
  if (error) throw error;
  taskId = data.id;
});

await run('Coach: INSERT message (sender=coach)', async () => {
  const { error } = await coach
    .from('messages')
    .insert({ coach_id: coachId, player_id: playerId, sender: 'coach', body: 'Hola jugador (smoke)' });
  if (error) throw error;
});

// --- RLS reads del player --------------------------------------------------
await run('Player: ve SU propia ficha (RLS players_self_read)', async () => {
  const { data, error } = await player.from('players').select('id').eq('id', playerId);
  if (error) throw error;
  must(data.length === 1, 'player no ve su ficha');
});

await run('Player: ve sus matches / tasks / messages', async () => {
  const m = await player.from('matches').select('id').eq('player_id', playerId);
  const t = await player.from('tasks').select('id').eq('player_id', playerId);
  const ms = await player.from('messages').select('id').eq('player_id', playerId);
  if (m.error || t.error || ms.error) throw new Error('lectura cruzada falla');
  must(m.data.length >= 1 && t.data.length >= 1 && ms.data.length >= 1, 'no llegan rows al player');
});

// --- check_in con trigger de auto-status -----------------------------------
await run('Player: check_in con pain=8 → status pasa a unavailable (trigger)', async () => {
  const { error } = await player
    .from('check_ins')
    .upsert(
      { player_id: playerId, date: '2026-05-22', mood: 3, energy: 3, sleep_hours: 7, pain_level: 8, pain_zone: 'rodilla' },
      { onConflict: 'player_id,date' },
    );
  if (error) throw error;
  // Coach relee status
  const { data, error: e2 } = await coach.from('players').select('status').eq('id', playerId).single();
  if (e2) throw e2;
  must(data.status === 'unavailable', `auto-status no aplicó (status=${data.status})`);
});

// --- Player RPCs -----------------------------------------------------------
await run('Player: set_my_task_done', async () => {
  const { data, error } = await player.rpc('set_my_task_done', { task_id: taskId, is_done: true });
  if (error) throw error;
  must(data?.success === true, `rpc fail: ${JSON.stringify(data)}`);
});

await run('Player: set_my_training_done', async () => {
  const { data, error } = await player.rpc('set_my_training_done', { session_id: trainingId, is_done: true });
  if (error) throw error;
  must(data?.success === true, `rpc fail: ${JSON.stringify(data)}`);
});

await run('Player: set_my_photo', async () => {
  const { data, error } = await player.rpc('set_my_photo', { url: 'https://example.com/p.png' });
  if (error) throw error;
  must(data?.success === true, `rpc fail: ${JSON.stringify(data)}`);
});

await run('Player: INSERT message (sender=player)', async () => {
  const { error } = await player.from('messages').insert({
    coach_id: coachId,
    player_id: playerId,
    sender: 'player',
    body: 'Hola míster (smoke)',
  });
  if (error) throw error;
});

// --- coach_profiles / videos / video_analysis / assessments ---------------
await run('Coach: upsert coach_profiles', async () => {
  const { error } = await coach
    .from('coach_profiles')
    .upsert({ user_id: coachId, name: 'Smoke Coach', brand_name: 'Smoke FC', brand_color: '#7c3aed' });
  if (error) throw error;
});

let videoId;
await run('Coach: INSERT video', async () => {
  const { data, error } = await coach
    .from('videos')
    .insert({ coach_id: coachId, player_id: playerId, title: 'Smoke vídeo', url: 'https://example.com/v.mp4', size_mb: 10 })
    .select()
    .single();
  if (error) throw error;
  videoId = data.id;
});

await run('Coach: INSERT video_analysis (compartido con jugador)', async () => {
  const { error } = await coach.from('video_analysis').insert({
    coach_id: coachId,
    player_id: playerId,
    title: 'Smoke análisis',
    video_url: 'https://example.com/a.mp4',
    video_type: 'link',
    comment: 'Mira el min 12',
  });
  if (error) throw error;
});

await run('Player: lee el video_analysis compartido (RLS player_read)', async () => {
  const { data, error } = await player.from('video_analysis').select('id').eq('player_id', playerId);
  if (error) throw error;
  must(data.length === 1, 'player no ve su análisis');
});

await run('Coach: INSERT assessment', async () => {
  const { error } = await coach.from('assessments').insert({
    coach_id: coachId,
    player_id: playerId,
    height_cm: 176.5,
    weight_kg: 68.5,
    vertical_jump: 42,
    rm_squat: 90,
  });
  if (error) throw error;
});

// --- Edge function ai-coach (5 modos, fallback porque no hay clave) --------
const modes = [
  { mode: 'chat', payload: { question: '¿Quién necesita atención?' } },
  { mode: 'metrics', payload: { player: { name: 'Smoke', score: 70, adherence: 80 } } },
  { mode: 'report', payload: { type: 'weekly', playerName: 'Smoke', period: 'Esta semana', context: 'sin datos' } },
  { mode: 'season-import', payload: { text: '12/09/2025 vs Las Rozas 2-1 Titular 90' } },
  { mode: 'player-import', payload: { text: 'Iker, 17 años, Mediapunta, diestro' } },
];
for (const m of modes) {
  await run(`Edge fn ai-coach mode=${m.mode}`, async () => {
    const { data, error } = await coach.functions.invoke('ai-coach', { body: m });
    if (error) throw error;
    must(data && typeof data === 'object', 'respuesta vacía');
    must(!data.error, `error en respuesta: ${data.error}`);
  });
}

// --- Cleanup local (player borra checkin propio; coach borra resto) -------
await run('Cleanup: coach DELETE player (cascada a matches/tasks/etc.)', async () => {
  const { error } = await coach.from('players').delete().eq('id', playerId);
  if (error) throw error;
});

await run('Cleanup: coach DELETE coach_profile + video', async () => {
  await coach.from('coach_profiles').delete().eq('user_id', coachId);
  await coach.from('videos').delete().eq('coach_id', coachId);
});

// --- Resumen ---------------------------------------------------------------
const pass = results.filter((r) => r.ok).length;
const fail = results.filter((r) => !r.ok);
console.log(`\n────────────────────────────────────────`);
console.log(`Resultado: ${pass}/${results.length} OK`);
if (fail.length) {
  console.log(`\nFallos:`);
  for (const f of fail) console.log(`  • ${f.label} — ${f.err}`);
}
console.log(`\nUsers de prueba creados:`);
console.log(`  coach:  ${COACH_EMAIL}`);
console.log(`  player: ${PLAYER_EMAIL}`);
console.log(`(limpieza de auth.users se hace por separado via MCP)`);
process.exit(fail.length ? 1 : 0);
