import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke E2E. Sirve el build estático (dist/) y comprueba que la app arranca.
 * Requiere: `npm run build` y `npx playwright install chromium` la primera vez.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/preview-static.mjs dist 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
