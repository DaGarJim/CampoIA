import { expect, test, type Page } from '@playwright/test';

// Journey LIVE contra Supabase staging: registro real de coach → crear jugador
// (guardado real) → pasaporte y acciones → código de invitación → registro del
// jugador con ese código → check-in / tareas / chat.
// Cada test mantiene UNA sesión (un contexto) porque Playwright aísla contextos
// por test. Serial: el jugador necesita el código que genera el coach.

const TS = Date.now();
const COACH = { email: `e2e-coach-${TS}@campoia.app`, password: 'E2E-Campo!2025', name: 'E2E Coach' };
const PLAYER = { email: `e2e-player-${TS}@campoia.app`, password: 'E2E-Campo!2025', name: 'E2E Jugador' };
const PLAYER_NAME = `Jugador E2E ${TS}`;

let inviteCode = '';

async function register(page: Page, role: 'coach' | 'player', user: typeof COACH, code?: string) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Crear cuenta' }).click(); // toggle login → registro
  if (role === 'player') await page.getByRole('button', { name: 'Jugador' }).click();
  await page.getByLabel('Nombre').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Contraseña').fill(user.password);
  if (role === 'player' && code) await page.getByLabel('Código de invitación').fill(code);
  await page.getByRole('button', { name: 'Crear cuenta' }).click(); // submit
}

test.describe.serial('Journey live', () => {
  // Opt-in: toca Supabase staging y crea usuarios reales (e2e-*). Por defecto se
  // salta para que `npm run test:e2e` siga siendo determinista y sin efectos.
  test.beforeEach(() => {
    test.skip(!process.env.E2E_LIVE, 'Journey live: ejecutar con E2E_LIVE=1');
  });

  test('coach: registro → crear jugador → pasaporte → invitar → atributos → tarea', async ({ page }) => {
    // Registro y dashboard
    await register(page, 'coach', COACH);
    await expect(page.locator('header').getByText('Centro de mando', { exact: true })).toBeVisible({ timeout: 20_000 });
    const onboarding = page.getByText('Bienvenido a CAMPO');
    if (await onboarding.isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /Empezar de cero/ }).click();
    }

    // Crear jugador (GUARDADO REAL — el bug original)
    await page.goto('/players');
    await page.getByRole('button', { name: /Añadir jugador/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Nombre').fill(PLAYER_NAME);
    await page.locator('#p-pos').selectOption('Mediocentro');
    await page.locator('#p-age').fill('18');
    await page.locator('#p-foot').selectOption('Derecho');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('No se pudo guardar.')).toHaveCount(0);
    await expect(page.getByText(PLAYER_NAME)).toBeVisible({ timeout: 15_000 });

    // Pasaporte
    await page.getByText(PLAYER_NAME).click();
    await expect(page.getByText(PLAYER_NAME).first()).toBeVisible();

    // Invitar → capturar código del toast
    await page.getByRole('button', { name: 'Invitar' }).click();
    const toast = page.getByText(/Código [A-Z0-9]{6} copiado/);
    await expect(toast).toBeVisible({ timeout: 10_000 });
    inviteCode = (await toast.textContent())!.match(/Código ([A-Z0-9]{6}) copiado/)![1];
    expect(inviteCode).toMatch(/^[A-Z0-9]{6}$/);

    // Editar atributos (updatePlayer real)
    await page.getByRole('button', { name: 'Atributos' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#attr-tecnica').fill('88');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Atributos actualizados')).toBeVisible({ timeout: 10_000 });

    // Asignar tarea desde el pasaporte
    await page.getByRole('button', { name: 'Tarea' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Descripción').fill('Tarea E2E: movilidad de cadera');
    await page.getByRole('button', { name: 'Asignar' }).click();
    // Esperar a que la mutación termine (el diálogo se cierra) antes de navegar,
    // si no la navegación cancela el POST en vuelo.
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10_000 });
    await page.goto('/tasks');
    await expect(page.getByText('Tarea E2E: movilidad de cadera')).toBeVisible({ timeout: 10_000 });
  });

  test('jugador: registro con código → portal → check-in → ve su tarea → chat', async ({ page }) => {
    expect(inviteCode).toMatch(/^[A-Z0-9]{6}$/);

    // Registro del jugador con el código
    await register(page, 'player', PLAYER, inviteCode);
    await expect(page.getByText(/XP de la semana/)).toBeVisible({ timeout: 20_000 });

    // Check-in (insert real + trigger)
    await page.goto('/player/checkin');
    await page.getByRole('button', { name: 'Guardar check-in' }).click();
    await expect(page.getByText(/Check-in guardado/)).toBeVisible({ timeout: 15_000 });

    // Ve la tarea que le asignó el coach
    await page.goto('/player/tasks');
    await expect(page.getByText('Tarea E2E: movilidad de cadera')).toBeVisible({ timeout: 10_000 });

    // Chat: escribe a su coach (insert real, sender=player)
    await page.goto('/player/chat');
    await page.getByPlaceholder('Mensaje a tu coach…').fill('Hola míster, mensaje E2E');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('Hola míster, mensaje E2E')).toBeVisible({ timeout: 10_000 });
  });
});
