const { test, expect } = require('@playwright/test');

test.describe('Dominio de ventas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    await page.evaluate(() => localStorage.clear());
  });

  test('aplica descuento al carrito y conserva el snapshot', async ({ page }) => {
    const result = await page.evaluate(() => {
      const item = {
        productoId: 1, productoNombre: 'Producto', cantidad: 2,
        precioUnit: 100, costoUnit: 40, gananciaUnit: 60,
        subtotal: 200, costoTotal: 80, gananciaTotal: 120,
      };
      const sale = AppSales.createSale({
        items: [item],
        finalPrice: 170,
        label: 'Promo',
        now: new Date('2026-02-10T12:00:00.000Z'),
      });
      item.precioUnit = 999;
      return sale;
    });

    expect(result.totalCobrado).toBe(170);
    expect(result.descuento).toBe(30);
    expect(result.totalGanancia).toBe(90);
    expect(result.items[0].precioUnit).toBe(100);
  });

  test('registra seña y permite pagos parciales hasta completar', async ({ page }) => {
    const result = await page.evaluate(() => {
      const base = AppSales.createSale({
        items: [{
          productoId: 1, productoNombre: 'Producto', cantidad: 1,
          precioUnit: 100, costoUnit: 50, gananciaUnit: 50,
          subtotal: 100, costoTotal: 50, gananciaTotal: 50,
        }],
        finalPrice: 100,
        credit: true,
        deposit: 20,
      });
      const partial = AppSales.applyPayment(base, 30, 'Transferencia');
      const complete = AppSales.applyPayment(partial, 80, 'Efectivo');
      return { base, partial, complete };
    });

    expect(result.base.montoPagado).toBe(20);
    expect(result.partial.montoPagado).toBe(50);
    expect(result.partial.fiado).toBe(true);
    expect(result.complete.montoPagado).toBe(100);
    expect(result.complete.fiado).toBe(false);
  });
});
