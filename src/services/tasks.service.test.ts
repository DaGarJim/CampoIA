import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({ supabase: supabaseMock }));

describe('tasks.service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('setTaskDone updates tasks directly for coach-owned mutations', async () => {
    const update = vi.fn().mockReturnThis();
    const eq = vi.fn().mockResolvedValue({ error: null });
    supabaseMock.from.mockReturnValue({ update, eq });

    const { setTaskDone } = await import('./tasks.service');
    await setTaskDone('task-1', true);

    expect(supabaseMock.from).toHaveBeenCalledWith('tasks');
    expect(update).toHaveBeenCalledWith({ done: true });
    expect(eq).toHaveBeenCalledWith('id', 'task-1');
    expect(supabaseMock.rpc).not.toHaveBeenCalled();
  });

  it('setMyTaskDone uses the player-safe rpc', async () => {
    supabaseMock.rpc.mockResolvedValue({ data: { success: true }, error: null });

    const { setMyTaskDone } = await import('./tasks.service');
    await setMyTaskDone('task-1', false);

    expect(supabaseMock.rpc).toHaveBeenCalledWith('set_my_task_done', {
      task_id: 'task-1',
      is_done: false,
    });
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });
});
