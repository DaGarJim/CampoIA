import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Player } from '@/types/domain';

const saveMock = vi.hoisted(() => vi.fn());
const jsPDFCtor = vi.hoisted(() =>
  vi.fn(() => ({
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    save: saveMock,
  })),
);

vi.mock('jspdf', () => ({ jsPDF: jsPDFCtor }));

function player(name: string): Player {
  return {
    id: 'p1',
    coach_id: 'c1',
    auth_user_id: null,
    name,
    pos: 'MC',
    pos_group: null,
    age: 20,
    foot: 'Derecho',
    club: 'CAMPO FC',
    category: null,
    status: 'available',
    trend: 'eq',
    score: 80,
    adherence: 90,
    mins: 100,
    callups: 5,
    played: 4,
    scored: 2,
    assisted: 1,
    sleep: null,
    tag: null,
    height_cm: null,
    weight_kg: null,
    photo_url: null,
    created_at: '2026-05-25T00:00:00Z',
  };
}

describe('generatePlayerReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lazy-loads jsPDF (dynamic import) and is async', async () => {
    const { generatePlayerReport } = await import('./pdf');
    const result = generatePlayerReport(player('Ana'), 'Coach');
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(jsPDFCtor).toHaveBeenCalledTimes(1);
  });

  it('sanitizes accents and symbols in the filename', async () => {
    const { generatePlayerReport } = await import('./pdf');
    await generatePlayerReport(player('José Pérez #1'), 'Coach');
    expect(saveMock).toHaveBeenCalledWith('CAMPO_Jose_Perez_1.pdf');
  });

  it('falls back to "jugador" when the name has no safe characters', async () => {
    const { generatePlayerReport } = await import('./pdf');
    await generatePlayerReport(player('!!! ###'), 'Coach');
    expect(saveMock).toHaveBeenCalledWith('CAMPO_jugador.pdf');
  });
});
