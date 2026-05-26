import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePlayer } from '@/test/factories';

const saveMock = vi.hoisted(() => vi.fn());
const jsPDFCtor = vi.hoisted(() =>
  vi.fn(() => ({
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    setDrawColor: vi.fn(),
    line: vi.fn(),
    splitTextToSize: vi.fn((t: string) => [t]),
    save: saveMock,
  })),
);

vi.mock('jspdf', () => ({ jsPDF: jsPDFCtor }));

function player(name: string) {
  return makePlayer({ name, pos: 'MC', age: 20, score: 80, adherence: 90 });
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

describe('generatePlayerDossier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('genera el dossier con sufijo _dossier y es async', async () => {
    const { generatePlayerDossier } = await import('./pdf');
    const result = generatePlayerDossier(player('María Núñez'), null);
    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(jsPDFCtor).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith('CAMPO_Maria_Nunez_dossier.pdf');
  });
});
