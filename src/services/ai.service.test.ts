import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePlayer } from '@/test/factories';

const supabaseMock = vi.hoisted(() => ({
  functions: { invoke: vi.fn() },
}));

vi.mock('@/lib/supabase', () => ({ supabase: supabaseMock }));

describe('ai.service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('askCoachAI envía modo chat y devuelve la respuesta', async () => {
    supabaseMock.functions.invoke.mockResolvedValue({ data: { reply: 'Hola' }, error: null });
    const { askCoachAI } = await import('./ai.service');
    const reply = await askCoachAI('¿Quién necesita atención?', 'CTX');
    expect(reply).toBe('Hola');
    expect(supabaseMock.functions.invoke).toHaveBeenCalledWith('ai-coach', {
      body: { mode: 'chat', payload: { question: '¿Quién necesita atención?', context: 'CTX', conversation: undefined } },
    });
  });

  it('lanza error legible si la Edge Function falla', async () => {
    supabaseMock.functions.invoke.mockResolvedValue({ data: null, error: new Error('boom') });
    const { askCoachAI } = await import('./ai.service');
    await expect(askCoachAI('hola')).rejects.toThrow(/no está disponible/i);
  });

  it('generateAIMetrics usa el modo metrics', async () => {
    supabaseMock.functions.invoke.mockResolvedValue({
      data: { ai_attributes: {}, ai_metrics: {}, strength: 's', improve: 'i' },
      error: null,
    });
    const { generateAIMetrics } = await import('./ai.service');
    await generateAIMetrics(makePlayer({ name: 'Ana' }));
    const call = supabaseMock.functions.invoke.mock.calls[0][1];
    expect(call.body.mode).toBe('metrics');
    expect(call.body.payload.player.name).toBe('Ana');
  });

  it('generateReport usa el modo report y devuelve markdown', async () => {
    supabaseMock.functions.invoke.mockResolvedValue({ data: { markdown: '# Informe' }, error: null });
    const { generateReport } = await import('./ai.service');
    const md = await generateReport({ type: 'weekly', playerName: 'Cartera', period: 'Este mes', context: 'CTX' });
    expect(md).toBe('# Informe');
    expect(supabaseMock.functions.invoke.mock.calls[0][1].body.mode).toBe('report');
  });

  it('importSeason devuelve la lista de partidos parseados', async () => {
    supabaseMock.functions.invoke.mockResolvedValue({
      data: { matches: [{ date: '2026-05-01', rival: 'X', result: '2-0', role: 'Titular', mins: 90 }] },
      error: null,
    });
    const { importSeason } = await import('./ai.service');
    const out = await importSeason('texto');
    expect(out).toHaveLength(1);
    expect(out[0].rival).toBe('X');
    expect(supabaseMock.functions.invoke.mock.calls[0][1].body.mode).toBe('season-import');
  });

  it('buildCoachContext resume jugadores, partidos y sesiones', async () => {
    const { buildCoachContext } = await import('./ai.service');
    const ctx = buildCoachContext(
      [makePlayer({ id: 'a', name: 'Ana', score: 80 })],
      [{ id: 'm', coach_id: 'c', player_id: 'a', date: '2026-05-01', rival: 'X', result: '2-0', mins: 90, called: 'yes', role: 'Titular', notes: null, created_at: '' }],
      [],
    );
    expect(ctx).toContain('JUGADORES (1)');
    expect(ctx).toContain('Ana');
    expect(ctx).toContain('ÚLTIMOS PARTIDOS');
    expect(ctx).toContain('vs X');
  });
});
