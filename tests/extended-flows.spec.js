const { test, expect } = require('@playwright/test');

const project = {
  id: 202,
  nombre: 'Jabon artesanal',
  datos: {
    nombreProducto: 'Jabon artesanal',
    unidades: 10,
    insumos: [{ nombre: 'Materiales', cantidad: 1, precio: 10000 }],
    servicios: [{ nombre: 'Trabajo', horas: 1, precio: 5000 }],
    margen: 50,
    modo: 'slider',
    gastosMensuales: 0,
    diasLaborales: 24,
  },
};

test.describe('Flujos extendidos', () => {
  test('anula y reactiva una venta sin borrar su historial', async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    await page.evaluate((data) => {
      localStorage.clear();
      AppStorage.saveProjects([data]);
    }, project);
    await page.reload();
    await page.selectOption('#select-producto', '202');
    await page.click('#btn-agregar');
    await page.click('#btn-finalizar');
    await page.getByRole('button', { name: 'Historial' }).click();
    await page.locator('.venta-header').click();
    await page.getByRole('button', { name: 'Anular venta' }).click();
    await page.fill('#anular-motivo', 'Operacion cancelada');
    await page.getByRole('button', { name: /Confirmar anulaci/ }).click();
    await expect(page.locator('.venta-item')).toHaveCount(1);
    await expect(page.locator('.venta-item')).toHaveClass(/anulada/);
    await expect(page.locator('.venta-item')).toContainText('Operacion cancelada');

    await page.locator('.venta-header').click();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Reactivar venta' }).click();
    await expect(page.locator('.venta-item')).not.toHaveClass(/anulada/);
    expect(await page.evaluate(() => AppStorage.getSales()[0].anulada)).toBe(false);
  });

  test('ofrece meses historicos en el selector PDF', async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    await page.evaluate(() => {
      localStorage.clear();
      AppStorage.saveSales([AppSales.createSale({
        items: [{ productoNombre: 'Demo', cantidad: 1, precioUnit: 100, costoUnit: 50, gananciaUnit: 50, subtotal: 100, costoTotal: 50, gananciaTotal: 50 }],
        finalPrice: 100,
        now: new Date('2026-02-10T12:00:00.000Z'),
      })]);
      renderizarHistorial();
    });
    await expect(page.locator('#select-mes-pdf option[value="2026-02"]')).toHaveText(/Febrero(?: de)? 2026/i);
  });

  test('rechaza backups corruptos sin sobrescribir proyectos', async ({ page }) => {
    await page.goto('/modules/calculadora/');
    const result = await page.evaluate(() => {
      localStorage.clear();
      AppStorage.saveProjects([{ id: 9, nombre: 'Conservar', datos: {} }]);
      let message = '';
      try { AppStorage.restoreBackup({ calculadora_proyectos: 'no-es-lista' }); }
      catch (error) { message = error.message; }
      return { message, projects: AppStorage.getProjects() };
    });
    expect(result.message).toMatch(/proyectos/i);
    expect(result.projects[0].nombre).toBe('Conservar');
  });
});

test('los filtros de prompts funcionan con teclado', async ({ page }) => {
  await page.goto('/modules/guiadeprompts/');
  const filter = page.locator('#filter-toggle');
  await filter.focus();
  await page.keyboard.press('Enter');
  await expect(filter).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Enter');
  await expect(filter).toHaveAttribute('aria-expanded', 'false');
});

test('el campo HEX actualiza la paleta', async ({ page }) => {
  await page.goto('/modules/combinadordecolores/');
  await page.locator('[data-color-tab="hex"]').click();
  await page.fill('#hex-input', '#123456');
  await expect(page.locator('#copy-hex-btn')).toContainText('#123456');
  await expect(page.locator('.palette-card').first()).toBeVisible();
});

