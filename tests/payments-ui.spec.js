const { test, expect } = require('@playwright/test');

test('registra pagos parciales y limita el último cobro al saldo', async ({ page }) => {
  await page.goto('/modules/registrodeventas/');
  await page.evaluate(() => {
    localStorage.clear();
    const sale = AppSales.createSale({
      items: [{ productoNombre: 'Demo', cantidad: 1, precioUnit: 100, costoUnit: 40, gananciaUnit: 60, subtotal: 100, costoTotal: 40, gananciaTotal: 60 }],
      finalPrice: 100,
      credit: true,
      deposit: 20,
      now: new Date(),
    });
    AppStorage.saveSales([sale]);
  });

  await page.getByRole('button', { name: 'Historial' }).click();
  await page.locator('.venta-header').click();
  await page.fill('[id^="cobro-monto-"]', '30');
  await page.selectOption('[id^="cobro-medio-"]', 'Transferencia');
  await page.getByRole('button', { name: 'Confirmar pago' }).click();

  let sale = await page.evaluate(() => AppStorage.getSales()[0]);
  expect(sale.montoPagado).toBe(50);
  expect(sale.fiado).toBe(true);
  expect(sale.pagos).toHaveLength(2);

  await page.locator('.venta-header').click();
  await page.fill('[id^="cobro-monto-"]', '1000');
  await page.getByRole('button', { name: 'Confirmar pago' }).click();
  sale = await page.evaluate(() => AppStorage.getSales()[0]);
  expect(sale.montoPagado).toBe(100);
  expect(sale.fiado).toBe(false);
  expect(sale.pagos[2].monto).toBe(50);
});
