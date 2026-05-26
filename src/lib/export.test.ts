import { describe, expect, it } from 'vitest';
import { buildCsv, buildJson, type ExportData } from './export';
import { makePlayer } from '@/test/factories';

const data: ExportData = {
  profile: null,
  players: [makePlayer({ name: 'Ana, "la crack"', club: 'CD\nDemo' })],
  matches: [],
  trainings: [],
  tasks: [],
};

describe('export', () => {
  it('buildJson serializa la estructura completa', () => {
    const parsed = JSON.parse(buildJson(data));
    expect(parsed.players).toHaveLength(1);
    expect(parsed).toHaveProperty('matches');
    expect(parsed).toHaveProperty('trainings');
  });

  it('buildCsv escapa comas, comillas y saltos de línea', () => {
    const csv = buildCsv(data);
    expect(csv).toContain('# Jugadores');
    expect(csv).toContain('"Ana, ""la crack"""');
    expect(csv).toContain('"CD\nDemo"');
  });

  it('buildCsv marca secciones vacías', () => {
    expect(buildCsv(data)).toContain('# Partidos\n(sin datos)');
  });
});
