import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Role } from '@/types/domain';

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput extends SignInInput {
  name: string;
  role: Role;
  inviteCode?: string;
}

/** Role derived from the database, or `null` when the user is not provisioned yet. */
export type DetectedRole = Role | null;

/** Normaliza un código de invitación: solo alfanuméricos en mayúsculas. */
export function normalizeInviteCode(code?: string): string | undefined {
  const normalized = code?.replace(/[^a-z0-9]/gi, '').toUpperCase();
  return normalized || undefined;
}

export async function signIn({ email, password }: SignInInput): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/**
 * Crea la cuenta y guarda el rol (y el código de invitación del jugador) en
 * `user_metadata`. El metadata es solo una pista de aprovisionamiento: nunca se
 * inserta directamente en `user_roles` desde el cliente. El rol real se concede
 * en la base de datos vía RPC (`register_coach` / `claim_invite_code`) en el
 * primer inicio de sesión autenticado (ver `provisionSignedInUser`).
 */
export async function signUp({
  email,
  password,
  name,
  role,
  inviteCode,
}: SignUpInput): Promise<{ needsConfirmation: boolean }> {
  const data: Record<string, unknown> = { name, role };
  if (role === 'player') {
    const code = normalizeInviteCode(inviteCode);
    if (code) data.invite_code = code;
  }

  const { data: result, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data },
  });
  if (error) throw error;

  return { needsConfirmation: !result.session };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

/** Lee el rol concedido en la base de datos (fuente de autorización real). */
async function getDbRole(userId: string): Promise<Role | null> {
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  if (error) throw error;
  const roles = (data ?? []) as Array<{ role: Role }>;
  if (roles.some((r) => r.role === 'coach')) return 'coach';
  if (roles.some((r) => r.role === 'player')) return 'player';
  return null;
}

/**
 * Concede el rol en la base de datos a partir de la pista de `user_metadata`.
 * Se ejecuta en el primer inicio de sesión autenticado (por si la confirmación
 * por email retrasó la creación de la sesión). Idempotente: si el usuario ya
 * tiene rol, no hace nada. No usa `user_metadata.role` como autorización: solo
 * lo usa para decidir qué RPC llamar; el rol efectivo siempre se relee de la BD.
 */
export async function provisionSignedInUser(user: User): Promise<void> {
  const currentRole = await getDbRole(user.id);
  if (currentRole) return;

  const metadata = user.user_metadata as { role?: string; invite_code?: string } | undefined;

  if (metadata?.role === 'coach') {
    const { error } = await supabase.rpc('register_coach');
    if (error) throw error;
    return;
  }

  if (metadata?.role === 'player') {
    const inviteCode = normalizeInviteCode(metadata.invite_code);
    if (!inviteCode) throw new Error('Falta el código de invitación del jugador.');
    const { data, error } = await supabase.rpc('claim_invite_code', { code: inviteCode });
    if (error) throw error;
    const result = data as { success?: boolean; error?: string } | null;
    if (result?.success === false) throw new Error(result.error ?? 'Código de invitación no válido.');
  }
}

/**
 * Aprovisiona (si hace falta) y devuelve el rol REAL del usuario leído de la BD:
 * 1) `user_roles`, 2) ficha en `players` (`auth_user_id`). Devuelve `null` si el
 * usuario está autenticado pero no se pudo asociar a ningún rol/ficha.
 */
export async function detectRole(user: User): Promise<DetectedRole> {
  await provisionSignedInUser(user);

  const dbRole = await getDbRole(user.id);
  if (dbRole) return dbRole;

  const { data: players } = await supabase
    .from('players')
    .select('id')
    .eq('auth_user_id', user.id)
    .limit(1);
  if (Array.isArray(players) && players.length > 0) return 'player';

  return null;
}

export function displayName(user: User): string {
  const metaName = (user.user_metadata as { name?: string } | undefined)?.name;
  return metaName ?? user.email?.split('@')[0] ?? 'Coach';
}
