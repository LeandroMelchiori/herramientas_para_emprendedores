const { test, expect } = require('@playwright/test');

test.describe('Calculadora de Costos', () => {
  test('debería renderizar la calculadora y sus pestañas', async ({ page }) => {
    await page.goto('/modules/calculadora/');
    await expect(page).toHaveTitle(/Calculadora/);
    await expect(page.locator('button.nav-tab:has-text("Insumos")')).toBeVisible();
    await expect(page.locator('button.nav-tab:has-text("Servicios")')).toBeVisible();
    await expect(page.locator('#nombre-producto')).toBeVisible();
  });
});
