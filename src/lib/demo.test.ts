import { afterEach, describe, expect, it, vi } from 'vitest';
import { demoRole, isDemo } from './demo';

describe('modo demo', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    try {
      window.localStorage.clear();
    } catch {
      /* noop */
    }
  });

  it('está DESACTIVADO por defecto (sin VITE_DEMO)', () => {
    expect(isDemo()).toBe(false);
    expect(demoRole()).toBeNull();
  });

  it('build sin flag: ni con señal de runtime se activa (prod seguro)', () => {
    vi.unstubAllEnvs(); // VITE_DEMO ausente
    window.localStorage.setItem('campo_demo', 'coach');
    expect(demoRole()).toBeNull();
    window.localStorage.clear();
  });

  it('build demo SIN señal de runtime → null (muestra login)', () => {
    vi.stubEnv('VITE_DEMO', '1');
    expect(demoRole()).toBeNull();
  });

  it('build demo + señal de runtime (localStorage) → activa el rol', () => {
    vi.stubEnv('VITE_DEMO', '1');
    window.localStorage.setItem('campo_demo', 'coach');
    expect(demoRole()).toBe('coach');
    window.localStorage.setItem('campo_demo', 'player');
    expect(demoRole()).toBe('player');
  });

  it('ignora señales no válidas', () => {
    vi.stubEnv('VITE_DEMO', '1');
    window.localStorage.setItem('campo_demo', 'admin');
    expect(demoRole()).toBeNull();
  });
});
