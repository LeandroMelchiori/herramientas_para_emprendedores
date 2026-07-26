const { test, expect } = require('@playwright/test');

test.describe('Reglas de dominio compartidas', () => {
  test('calcula costos, margen y punto de equilibrio sin depender del DOM', async ({ page }) => {
    await page.goto('/modules/calculadora/');
    const result = await page.evaluate(() => AppCosting.calculate({
      supplies: [{ cantidad: 2, precio: 1000 }],
      services: [{ horas: 1, precio: 5000 }],
      units: 10,
      margin: 50,
      mode: 'slider',
      monthlyExpenses: 10000,
      workDays: 20,
      incomeGoal: 5000,
    }));

    expect(result.costoUnitario).toBe(700);
    expect(result.precioVenta).toBe(1050);
    expect(result.gananciaNeta).toBe(350);
    expect(result.ventasMensuales).toBe(29);
    expect(result.ventasDiarias).toBe(2);
    expect(result.unidadesMeta).toBe(43);
  });

  test('normaliza proyectos guardados y respeta el precio manual', async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    const result = await page.evaluate(() => AppCosting.fromProject({
      id: 1,
      datos: {
        insumos: [{ cantidad: 1, precio: 3000 }],
        servicios: [],
        unidades: 3,
        modo: 'precio',
        precioManual: 1400,
        margen: 50,
        gastosMensuales: 9000,
        diasLaborales: 20,
      },
    }));

    expect(result.costoUnitario).toBe(1000);
    expect(result.precioVenta).toBe(1400);
    expect(result.gananciaNeta).toBe(400);
    expect(result.margenReal).toBe(40);
  });

  test('convierte colores y genera armonias previsibles', async ({ page }) => {
    await page.goto('/modules/combinadordecolores/');
    const result = await page.evaluate(() => ({
      red: AppColor.hslToHex(0, 100, 50),
      redHsl: AppColor.hexToHsl('#ff0000'),
      triad: AppColor.generatePalette(0, 100, 50, 'triadico'),
      contrast: AppColor.contrastRatio('#000000', '#ffffff'),
    }));

    expect(result.red).toBe('#ff0000');
    expect(result.redHsl).toEqual([0, 100, 50]);
    expect(result.triad.map(color => color.hex).slice(0, 3)).toEqual([
      '#ff0000', '#00ff00', '#0000ff',
    ]);
    expect(result.contrast).toBe(21);
  });
});

test.describe('Catalogos editoriales', () => {
  test('monta prompts y herramientas antes de inicializar filtros', async ({ page }) => {
    await page.goto('/modules/guiadeprompts/');
    await expect(page.locator('#prompt-catalog .prompt-card')).toHaveCount(32);

    await page.goto('/modules/herramientasdigitales/');
    await expect(page.locator('#tools-catalog .tool-card')).toHaveCount(26);
  });
});
