import { expect, test } from '@playwright/test';

test('muestra los dos roles cooperativos en pantalla dividida', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'EN BLANCO' })).toBeVisible();
  await page.getByRole('button', { name: 'Comenzar Historia' }).click();
  await expect(page.getByText('No recuerdas lo que paso la ultima semana...')).toBeVisible();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('region', { name: 'La Razon' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'La Emocion' })).toBeVisible();
  await expect(page.getByText('Jugador 1: Teclas WASD | Jugador 2: Flechas de Direccion')).toBeVisible();
  await expect(page.getByText('Continuar con [ESPACIO]')).toBeVisible();
});
