import { defineConfig, devices } from '@playwright/test';

/**
 * E2E de CAMPO. Sirve el build estático (dist/) construido con VITE_DEMO=1 para
 * que la MISMA build sirva: (a) el login real por defecto y los flujos live
 * contra Supabase staging, y (b) los recorridos demo con ?demo=coach|player.
 * Requiere `npx playwright install chromium` la primera vez.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'VITE_DEMO=1 npm run build && node scripts/preview-static.mjs dist 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
