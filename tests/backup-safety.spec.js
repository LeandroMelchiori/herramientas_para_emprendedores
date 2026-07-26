const { test, expect } = require('@playwright/test');

test.describe('Restauración reversible', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modules/calculadora/');
    await page.evaluate(() => localStorage.clear());
  });

  test('crea una copia preventiva y recupera el estado anterior', async ({ page }) => {
    const result = await page.evaluate(() => {
      AppStorage.saveProjects([{ id: 1, nombre: 'Antes', datos: {} }]);
      AppStorage.saveSales([{ id: 10, fecha: '2026-01-10T10:00:00.000Z', items: [], totalCobrado: 10 }]);
      AppStorage.restoreBackup({
        calculadora_proyectos: [{ id: 2, nombre: 'Importado', datos: {} }],
        ventas_historial: [],
      });
      const afterImport = AppStorage.getProjects()[0].nombre;
      const safetyExists = AppStorage.hasSafetyBackup();
      AppStorage.restoreSafetyBackup();
      return {
        afterImport,
        safetyExists,
        restoredProject: AppStorage.getProjects()[0].nombre,
        restoredSales: AppStorage.getSales().length,
        safetyAfterUndo: AppStorage.hasSafetyBackup(),
      };
    });

    expect(result.afterImport).toBe('Importado');
    expect(result.safetyExists).toBe(true);
    expect(result.restoredProject).toBe('Antes');
    expect(result.restoredSales).toBe(1);
    expect(result.safetyAfterUndo).toBe(false);
  });
});
