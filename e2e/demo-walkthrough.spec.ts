import { expect, test } from '@playwright/test';

// Recorrido determinista por TODAS las vistas usando el modo demo
// (?demo=coach|player), que siembra datos en memoria sin backend. Verifica que
// cada pantalla renderiza y que los diálogos clave abren.

const DEMO_PLAYER_ID = '00000000-0000-4000-8000-000000000100';

// [ruta, texto del título en el <header> del CoachShell]
const COACH_ROUTES: Array<[string, string]> = [
  ['/', 'Centro de mando'],
  ['/players', 'Jugadores'],
  ['/matches', 'Partidos'],
  ['/training', 'Entrenamientos'],
  ['/habits', 'Hábitos'],
  ['/metrics', 'Métricas'],
  ['/tasks', 'Tareas'],
  ['/messages', 'Mensajes'],
  ['/video', 'Vídeo'],
  ['/video-analysis', 'Vídeo análisis'],
  ['/ai', 'IA Coach'],
  ['/reports', 'Informes'],
  ['/settings', 'Ajustes'],
];

test.describe('Walkthrough demo — Coach', () => {
  for (const [path, title] of COACH_ROUTES) {
    test(`coach renderiza ${path}`, async ({ page }) => {
      await page.goto(`${path}?demo=coach`);
      await expect(page.locator('header').getByText(title, { exact: true })).toBeVisible();
    });
  }

  test('coach abre el Player Passport con sus pestañas', async ({ page }) => {
    await page.goto(`/players/${DEMO_PLAYER_ID}?demo=coach`);
    await expect(page.getByText('Iker Muñoz').first()).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Atributos' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Físico' })).toBeVisible();
    // Cambiar de pestaña funciona
    await page.getByRole('tab', { name: 'Competición' }).click();
    await expect(page.getByText('Minutos').first()).toBeVisible();
  });

  test('coach abre el diálogo "Añadir jugador"', async ({ page }) => {
    await page.goto('/players?demo=coach');
    await page.getByRole('button', { name: /Añadir jugador/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Nuevo jugador')).toBeVisible();
    await expect(page.getByText(/Datos físicos y valoración inicial/)).toBeVisible();
  });

  test('coach: Informes muestra los 6 tipos', async ({ page }) => {
    await page.goto('/reports?demo=coach');
    for (const t of ['Informe semanal', 'Informe para padres', 'Informe para el club', 'Informe post-partido', 'Informe mensual', 'Informe para representante']) {
      await expect(page.getByText(t)).toBeVisible();
    }
  });

  test('coach: Ajustes tiene las 4 pestañas', async ({ page }) => {
    await page.goto('/settings?demo=coach');
    for (const tab of ['Perfil', 'Marca', 'Preferencias', 'Cuenta']) {
      await expect(page.getByRole('tab', { name: tab })).toBeVisible();
    }
  });
});

const PLAYER_ROUTES: Array<[string, RegExp | string]> = [
  ['/player', /XP de la semana/],
  ['/player/checkin', 'Check-in diario'],
  ['/player/tasks', 'Misiones'],
  ['/player/matches', 'Tus partidos'],
  ['/player/chat', 'Mi coach'],
  ['/player/profile', 'Tu perfil'],
];

test.describe('Walkthrough demo — Jugador', () => {
  for (const [path, marker] of PLAYER_ROUTES) {
    test(`jugador renderiza ${path}`, async ({ page }) => {
      await page.goto(`${path}?demo=player`);
      await expect(page.getByText(marker).first()).toBeVisible();
    });
  }

  test('jugador: el check-in tiene slider de dolor y escalas', async ({ page }) => {
    await page.goto('/player/checkin?demo=player');
    await expect(page.getByText('Ánimo')).toBeVisible();
    await expect(page.getByText('Energía')).toBeVisible();
    await expect(page.getByText('Dolor')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guardar check-in' })).toBeVisible();
  });
});
