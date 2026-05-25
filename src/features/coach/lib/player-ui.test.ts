import { describe, expect, it } from 'vitest';
import { STATUS_META, scoreColor } from './player-ui';

describe('player-ui', () => {
  it('mapea estados a etiquetas y variantes', () => {
    expect(STATUS_META.available.label).toBe('Disponible');
    expect(STATUS_META.risk.variant).toBe('warning');
    expect(STATUS_META.injured.variant).toBe('danger');
  });

  it('asigna color según el score', () => {
    expect(scoreColor(85)).toContain('success');
    expect(scoreColor(65)).toContain('primary');
    expect(scoreColor(40)).toContain('warning');
    expect(scoreColor(null)).toContain('muted');
  });
});
