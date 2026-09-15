import { expect, test } from '@playwright/test';

test('muestra los dos roles cooperativos en pantalla dividida', async ({ page }) => {
  await page.request.post('/api/game/reset');
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'EN BLANCO' })).toBeVisible();
  await page.getByRole('button', { name: 'Controles e Instrucciones' }).click();
  await expect(page.getByRole('region', { name: 'Controles Jugador 1 La Razon' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Controles Jugador 2 La Emocion' })).toBeVisible();
  await expect(page.getByText('Resuelve acertijos, busca llaves logicas y desbloquea el camino de La Emocion.')).toBeVisible();
  await page.getByRole('button', { name: 'Volver al Menu Principal' }).click();

  await page.getByRole('button', { name: 'Comenzar Historia' }).click();
  await expect(page.getByText('No recuerdas lo que paso la ultima semana...')).toBeVisible();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('region', { name: 'La Razon' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'La Emocion' })).toBeVisible();
  await expect(page.getByText('PROGRESO DE MEMORIA: 0%')).toBeVisible();
  await expect(page.getByText('CORDURA DE LA MENTE')).toBeVisible();
  await expect(page.getByText('Barreras Co-op activas')).toBeVisible();

  await page.keyboard.press('a');
  await expect(page.getByRole('complementary', { name: 'Registro narrativo' })).toContainText('Accion rechazada: el destino queda fuera del tablero 7x7.');

  const moveResponsePromise = page.waitForResponse((response) => response.url().endsWith('/api/game/action') && response.request().method() === 'POST');
  await page.keyboard.press('s');
  await expect((await moveResponsePromise).ok()).toBeTruthy();
  await page.waitForTimeout(300);
  await page.keyboard.press('d');
  await page.waitForTimeout(300);
  await page.keyboard.press('s');

  await expect(page.getByRole('dialog', { name: 'RECUERDO #3: EL VELOCIMETRO' })).toBeVisible();
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.getByText('Paso 2 de 3')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.getByText('Paso 3 de 3')).toBeVisible();
  await expect(page.getByText('Guardar Recuerdo y Continuar [ESPACIO]')).toBeVisible();
});
