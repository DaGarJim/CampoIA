import { afterEach, describe, expect, it, vi } from 'vitest';
import { demoRole, isDemo } from './demo';

describe('modo demo', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('está DESACTIVADO por defecto (sin VITE_DEMO)', () => {
    expect(isDemo()).toBe(false);
    expect(demoRole()).toBeNull();
  });

  it('ignora valores no válidos', () => {
    vi.stubEnv('VITE_DEMO', 'admin');
    expect(isDemo()).toBe(false);
    expect(demoRole()).toBeNull();
  });

  it('se activa con coach o player', () => {
    vi.stubEnv('VITE_DEMO', 'coach');
    expect(demoRole()).toBe('coach');
    vi.stubEnv('VITE_DEMO', 'player');
    expect(demoRole()).toBe('player');
  });
});
