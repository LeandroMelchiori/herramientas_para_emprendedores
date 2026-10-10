const { test, expect } = require('@playwright/test');

const demoProject = {
  id: 101,
  nombre: 'Alfajores de maicena',
  fecha: '24/07/2026',
  datos: {
    _schema: 2,
    nombreProducto: 'Alfajores de maicena',
    unidades: 10,
    insumos: [{ nombre: 'Ingredientes', cantidad: 1, precio: 10000 }],
    servicios: [{ nombre: 'Mano de obra', horas: 1, precio: 5000 }],
    margen: 50,
    modo: 'slider',
    soloServicios: false,
    ivaActivo: false,
    precioManual: 0,
    gastosMensuales: 0,
    diasLaborales: 24,
    metaIngresos: 0,
  },
};

test.describe('Calculadora de costos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modules/calculadora/?reset');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('carga los modulos externos sin errores y autoguarda insumos', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await expect(page).toHaveTitle(/Calculadora/);
    await page.locator('#nombre-producto').fill('Pan casero');
    const firstRow = page.locator('#lista-insumos .row-insumo-wrap').first();
    await firstRow.locator('input').nth(0).fill('Harina');
    await firstRow.locator('input').nth(1).fill('2');
    await firstRow.locator('input').nth(2).fill('1500');
    await page.waitForTimeout(650);

    const draft = await page.evaluate(() => AppStorage.getCalculatorDraft());
    expect(draft.nombreProducto).toBe('Pan casero');
    expect(draft.insumos[0]).toMatchObject({ nombre: 'Harina', cantidad: 2, precio: 1500 });
    expect(errors).toEqual([]);
  });

  test('guarda y recupera proyectos mediante AppStorage', async ({ page }) => {
    await page.evaluate(project => AppStorage.saveProjects([project]), demoProject);
    await page.reload();
    await page.locator('.nav-tab').nth(4).click();
    await expect(page.locator('#lista-proyectos')).toContainText('Alfajores de maicena');
  });

  test('previsualiza precio y composicion en proyectos guardados', async ({ page }) => {
    await page.evaluate(project => AppStorage.saveProjects([project]), demoProject);
    await page.reload();
    await page.locator('.nav-tab').nth(4).click();
    const preview = page.locator('.proyecto-preview').first();
    await expect(preview).toContainText('Precio de venta');
    await expect(preview).toContainText('Costo por unidad');
    await expect(preview).toContainText('Costo: 67%');
    await expect(preview).toContainText('Ganancia: 33%');
    await expect(preview.locator('.proyecto-bar-costo')).toHaveAttribute('style', /width:67%/);
  });
});
