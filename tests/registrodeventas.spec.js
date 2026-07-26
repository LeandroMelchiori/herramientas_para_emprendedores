const { test, expect } = require('@playwright/test');

const project = {
  id: 202,
  nombre: 'Jabon artesanal',
  fecha: '24/07/2026',
  datos: {
    nombreProducto: 'Jabon artesanal',
    unidades: 10,
    insumos: [{ nombre: 'Materiales', cantidad: 1, precio: 10000 }],
    servicios: [{ nombre: 'Trabajo', horas: 1, precio: 5000 }],
    margen: 50,
    modo: 'slider',
    precioManual: 0,
    gastosMensuales: 0,
    diasLaborales: 24,
  },
};

test.describe('Registro de ventas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    await page.evaluate(projectData => {
      localStorage.clear();
      AppStorage.saveProjects([projectData]);
      AppStorage.saveSales([]);
    }, project);
    await page.reload();
  });

  test('arma un carrito y guarda un snapshot contable', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.selectOption('#select-producto', '202');
    await page.click('#btn-agregar');
    await expect(page.locator('#lista-carrito')).toContainText('Jabon artesanal');
    await page.fill('#input-precio-final', '2100');
    await page.selectOption('#select-pago', 'Efectivo');
    await page.click('#btn-finalizar');

    const sales = await page.evaluate(() => AppStorage.getSales());
    expect(sales).toHaveLength(1);
    expect(sales[0].items[0]).toMatchObject({ productoNombre: 'Jabon artesanal', costoUnit: 1500 });
    expect(sales[0].totalCobrado).toBe(2100);
    expect(sales[0].totalGanancia).toBe(600);
    expect(errors).toEqual([]);
  });

  test('registra una venta pendiente con sena', async ({ page }) => {
    await page.selectOption('#select-producto', '202');
    await page.click('#btn-agregar');
    await page.fill('#input-precio-final', '2250');
    await page.check('#check-fiado');
    await page.fill('#input-sena', '500');
    await page.click('#btn-finalizar');
    await page.getByRole('button', { name: 'Historial' }).click();

    await expect(page.locator('.venta-item').first()).toContainText(/SE.A|PENDIENTE/);
    const sale = await page.evaluate(() => AppStorage.getSales()[0]);
    expect(sale).toMatchObject({ fiado: true, montoPagado: 500 });
  });
});
