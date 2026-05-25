import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';

const supabaseMock = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({ supabase: supabaseMock }));

function user(metadata: Record<string, unknown>): User {
  return {
    id: 'user-1',
    app_metadata: {},
    user_metadata: metadata,
    aud: 'authenticated',
    created_at: '2026-05-25T00:00:00Z',
  } as User;
}

describe('auth.service provisioning', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('signUp stores player invite code in metadata and does not insert user_roles directly', async () => {
    const { signUp } = await import('./auth.service');
    supabaseMock.auth.signUp.mockResolvedValue({
      data: { user: user({ role: 'player', invite_code: 'ABC123' }), session: null },
      error: null,
    });

    await signUp({
      email: 'player@example.com',
      password: '123456',
      name: 'Player One',
      role: 'player',
      inviteCode: 'abc123',
    });

    expect(supabaseMock.auth.signUp).toHaveBeenCalledWith({
      email: 'player@example.com',
      password: '123456',
      options: { data: { name: 'Player One', role: 'player', invite_code: 'ABC123' } },
    });
    expect(supabaseMock.from).not.toHaveBeenCalledWith('user_roles');
  });

  it('detectRole provisions a coach via register_coach before reading DB role', async () => {
    const { detectRole } = await import('./auth.service');

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [{ role: 'coach' }] }),
      limit: vi.fn().mockResolvedValue({ data: [] }),
    });
    supabaseMock.rpc.mockResolvedValue({ data: { success: true }, error: null });

    const role = await detectRole(user({ role: 'coach' }));

    expect(supabaseMock.rpc).toHaveBeenCalledWith('register_coach');
    expect(role).toBe('coach');
  });

  it('detectRole provisions a player via claim_invite_code before reading DB role', async () => {
    const { detectRole } = await import('./auth.service');

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [{ role: 'player' }] }),
      limit: vi.fn().mockResolvedValue({ data: [] }),
    });
    supabaseMock.rpc.mockResolvedValue({ data: { success: true }, error: null });

    const role = await detectRole(user({ role: 'player', invite_code: 'ABC123' }));

    expect(supabaseMock.rpc).toHaveBeenCalledWith('claim_invite_code', { code: 'ABC123' });
    expect(role).toBe('player');
  });
});
