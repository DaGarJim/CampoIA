import { expect, test } from '@playwright/test';

test('la app arranca y muestra el login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'CAMPO' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

test('se puede alternar al formulario de registro', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByText('Soy')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrenador' })).toBeVisible();
});
