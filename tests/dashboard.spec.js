const { test, expect } = require('@playwright/test');

test.describe('Panel mensual', () => {
  test('separa facturación de cobros y compara contra el mes anterior', async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    const result = await page.evaluate(() => {
      const item = { productoNombre: 'Jabon', cantidad: 2, precioUnit: 100, costoUnit: 50, gananciaUnit: 50, subtotal: 200, costoTotal: 100, gananciaTotal: 100 };
      const january = AppSales.createSale({ items: [item], finalPrice: 200, now: new Date('2026-01-10T10:00:00.000Z') });
      const february = AppSales.createSale({ items: [item], finalPrice: 240, credit: true, deposit: 40, now: new Date('2026-02-10T10:00:00.000Z') });
      const paidLater = AppSales.applyPayment(february, 100, 'Transferencia', new Date('2026-03-02T10:00:00.000Z'));
      return {
        february: AppSalesDashboard.compareMonths([january, paidLater], '2026-02'),
        march: AppSalesDashboard.summarizeMonth([january, paidLater], '2026-03'),
      };
    });

    expect(result.february.current.facturado).toBe(240);
    expect(result.february.current.cobrado).toBe(40);
    expect(result.february.facturadoVariation).toBe(20);
    expect(result.february.current.masVendido.nombre).toBe('Jabon');
    expect(result.march.facturado).toBe(0);
    expect(result.march.cobrado).toBe(100);
  });

  test('renderiza el mes seleccionado con métricas principales', async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    await page.evaluate(() => {
      localStorage.clear();
      AppStorage.saveSales([AppSales.createSale({
        items: [{ productoNombre: 'Vela', cantidad: 1, precioUnit: 500, costoUnit: 200, gananciaUnit: 300, subtotal: 500, costoTotal: 200, gananciaTotal: 300 }],
        finalPrice: 500,
        now: new Date('2026-02-10T10:00:00.000Z'),
      })]);
      renderizarHistorial();
    });
    await page.getByRole('button', { name: 'Historial' }).click();
    await page.selectOption('#select-mes-panel', '2026-02');
    await expect(page.locator('#panel-mensual')).toContainText('Facturado');
    await expect(page.locator('#panel-mensual')).toContainText('Vela');
  });
});
