import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: supabaseMock }));

describe('assessments.service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('createAssessment inserta una instantánea con coach y player', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    supabaseMock.from.mockReturnValue({ insert });

    const { createAssessment } = await import('./assessments.service');
    await createAssessment('coach-1', 'player-1', { height_cm: 176.5, rm_squat: 90 });

    expect(supabaseMock.from).toHaveBeenCalledWith('assessments');
    const row = insert.mock.calls[0][0];
    expect(row.coach_id).toBe('coach-1');
    expect(row.player_id).toBe('player-1');
    expect(row.height_cm).toBe(176.5);
    expect(row.rm_squat).toBe(90);
    expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
