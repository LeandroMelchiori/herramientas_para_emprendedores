const { test, expect } = require('@playwright/test');

test.describe('Compatibilidad con datos existentes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    await page.evaluate(() => localStorage.clear());
  });

  test('conserva proyectos planos, proyectos actuales y campos desconocidos', async ({ page }) => {
    const result = await page.evaluate(() => {
      localStorage.setItem('calculadora_proyectos', JSON.stringify([
        { id: 1, nombreProducto: 'Legado', unidades: 10, campoFuturo: 'conservar' },
        { id: 2, nombre: 'Actual', datos: { nombreProducto: 'Actual', unidades: 5 }, meta: { taller: true } },
      ]));
      AppStorage.migrateStoredData();
      return {
        projects: AppStorage.getProjects(),
        raw: JSON.parse(localStorage.getItem('calculadora_proyectos')),
      };
    });

    expect(result.projects).toHaveLength(2);
    expect(result.projects[0].datos.unidades).toBe(10);
    expect(result.raw[0].campoFuturo).toBe('conservar');
    expect(result.raw[1].meta.taller).toBe(true);
  });

  test('completa ventas antiguas sin perder campos propios', async ({ page }) => {
    const sale = await page.evaluate(() => {
      localStorage.setItem('ventas_historial', JSON.stringify([{
        id: 7,
        fecha: '2025-02-12T10:00:00.000Z',
        items: [{ productoNombre: 'Pan', cantidad: 2, precioUnit: 100, costoUnit: 60 }],
        totalCobrado: 200,
        notaInterna: 'mantener',
      }]));
      AppStorage.migrateStoredData();
      return AppStorage.getSales()[0];
    });

    expect(sale.totalCosto).toBe(120);
    expect(sale.totalGanancia).toBe(80);
    expect(sale.montoPagado).toBe(200);
    expect(sale.notaInterna).toBe('mantener');
  });

  test('no sobrescribe la base si encuentra registros irreconocibles', async ({ page }) => {
    const result = await page.evaluate(() => {
      const original = [{ id: 1, nombre: 'Valido' }, 'registro-corrupto'];
      localStorage.setItem('calculadora_proyectos', JSON.stringify(original));
      const migration = AppStorage.migrateStoredData();
      return {
        migration,
        raw: JSON.parse(localStorage.getItem('calculadora_proyectos')),
      };
    });

    expect(result.migration.migrated).toBe(false);
    expect(result.migration.warnings).toHaveLength(1);
    expect(result.raw[1]).toBe('registro-corrupto');
  });

  test('conserva JSON corrupto sin reemplazarlo por una lista vacia', async ({ page }) => {
    const result = await page.evaluate(() => {
      localStorage.setItem('calculadora_proyectos', '[{incompleto');
      const migration = AppStorage.migrateStoredData();
      return { migration, raw: localStorage.getItem('calculadora_proyectos') };
    });
    expect(result.migration.migrated).toBe(false);
    expect(result.migration.warnings).toHaveLength(1);
    expect(result.raw).toBe('[{incompleto');
  });

});
