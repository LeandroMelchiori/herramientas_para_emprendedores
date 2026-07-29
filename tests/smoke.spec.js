const { test, expect } = require('@playwright/test');

const pages = [
  ['Inicio', '/'],
  ['Calculadora', '/modules/calculadora/'],
  ['Guia de prompts', '/modules/guiadeprompts/'],
  ['Combinador de colores', '/modules/combinadordecolores/'],
  ['Herramientas digitales', '/modules/herramientasdigitales/'],
  ['Registro de ventas', '/modules/registrodeventas/'],
];

for (const [name, path] of pages) {
  test(name + ' carga sin errores de JavaScript', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto(path);
    await expect(page.locator('body')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
