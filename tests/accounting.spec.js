const { test, expect } = require('@playwright/test');

test.describe('Gastos, anulaciones y cierres mensuales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    await page.evaluate(() => localStorage.clear());
  });

  test('registra gastos y los incorpora al resultado de caja', async ({ page }) => {
    const result = await page.evaluate(() => {
      const sale = AppSales.createSale({
        items: [{ productoNombre: 'Demo', cantidad: 1, subtotal: 500, costoTotal: 200, gananciaTotal: 300 }],
        finalPrice: 500,
        now: new Date('2026-02-10T10:00:00.000Z'),
      });
      const expense = AppExpenses.createExpense({ concept: 'Flete', category: 'Transporte', amount: 120, date: '2026-02-11' });
      AppStorage.saveSales([sale]);
      AppStorage.saveExpenses([expense]);
      const summary = AppSalesDashboard.summarizeMonth(AppStorage.getSales(), '2026-02', AppStorage.getExpenses());
      return { summary, backup: AppStorage.createBackup() };
    });
    expect(result.summary.gastos).toBe(120);
    expect(result.summary.resultadoCaja).toBe(380);
    expect(result.backup.gastos_historial).toHaveLength(1);
  });

  test('excluye ventas anuladas de los informes sin eliminarlas', async ({ page }) => {
    const result = await page.evaluate(() => {
      const sale = AppSales.createSale({
        items: [{ productoNombre: 'Demo', cantidad: 1, subtotal: 300, costoTotal: 100, gananciaTotal: 200 }],
        finalPrice: 300,
        now: new Date('2026-03-10T10:00:00.000Z'),
      });
      sale.anulada = true;
      sale.anuladaMotivo = 'Prueba';
      AppStorage.saveSales([sale]);
      return { saved: AppStorage.getSales(), summary: AppSalesDashboard.summarizeMonth(AppStorage.getSales(), '2026-03') };
    });
    expect(result.saved).toHaveLength(1);
    expect(result.summary.ventas).toBe(0);
    expect(result.summary.facturado).toBe(0);
  });

  test('crea un snapshot de cierre y conserva gastos y cierres en el backup', async ({ page }) => {
    const result = await page.evaluate(() => {
      const expense = AppExpenses.createExpense({ concept: 'Alquiler', amount: 1000, date: '2026-04-05' });
      const closure = AppClosures.createClosure('2026-04', [], [expense], new Date('2026-05-01T10:00:00.000Z'));
      AppStorage.saveExpenses([expense]);
      AppStorage.saveMonthlyClosures([closure]);
      const backup = AppStorage.createBackup();
      localStorage.clear();
      AppStorage.restoreBackup(backup);
      return { backup, closures: AppStorage.getMonthlyClosures(), expenses: AppStorage.getExpenses() };
    });
    expect(result.backup.version).toBe('5.0');
    expect(result.closures[0].metrics.gastos).toBe(1000);
    expect(result.expenses[0].concepto).toBe('Alquiler');
  });

  test('materializa una sola ocurrencia mensual de un gasto recurrente', async ({ page }) => {
    const result = await page.evaluate(() => {
      const source = AppExpenses.createExpense({ concept: 'Internet', amount: 50, date: '2026-01-31', monthly: true });
      const once = AppExpenses.materializeMonthly([source], new Date('2026-02-15T12:00:00'));
      return AppExpenses.materializeMonthly(once, new Date('2026-02-20T12:00:00'));
    });
    expect(result).toHaveLength(2);
    expect(result.filter(item => item.recurrenteOrigenId)).toHaveLength(1);
  });
});
