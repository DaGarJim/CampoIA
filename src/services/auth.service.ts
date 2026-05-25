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

export async function signIn({ email, password }: SignInInput): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp({
  email,
  password,
  name,
  role,
  inviteCode,
}: SignUpInput): Promise<{ needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  });
  if (error) throw error;
  if (data.user && !data.session) return { needsConfirmation: true };

  if (data.session && data.user) {
    await supabase.from('user_roles').insert({ user_id: data.user.id, role });
    if (role === 'player' && inviteCode) {
      const { data: claim, error: claimError } = await supabase.rpc('claim_invite_code', {
        code: inviteCode,
      });
      if (claimError) throw claimError;
      const result = claim as { success?: boolean; error?: string } | null;
      if (result && result.success === false) {
        throw new Error(result.error ?? 'Código de invitación no válido.');
      }
    }
  }
  return { needsConfirmation: false };
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

/**
 * Decide el rol del usuario: 1) metadata.role (elegido al registrarse),
 * 2) tabla user_roles, 3) ficha en players (auth_user_id), 4) coach por defecto.
 */
export async function detectRole(user: User): Promise<Role> {
  const metaRole = (user.user_metadata as { role?: string } | undefined)?.role;
  if (metaRole === 'player') return 'player';
  if (metaRole === 'coach') return 'coach';

  const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  if (Array.isArray(roles) && roles.length > 0) {
    const hasCoach = roles.some((r) => (r as { role: string }).role === 'coach');
    const hasPlayer = roles.some((r) => (r as { role: string }).role === 'player');
    if (hasPlayer && !hasCoach) return 'player';
    if (hasCoach) return 'coach';
  }

  const { data: players } = await supabase
    .from('players')
    .select('id')
    .eq('auth_user_id', user.id)
    .limit(1);
  if (Array.isArray(players) && players.length > 0) return 'player';

  return 'coach';
}

export function displayName(user: User): string {
  const metaName = (user.user_metadata as { name?: string } | undefined)?.name;
  return metaName ?? user.email?.split('@')[0] ?? 'Coach';
}
