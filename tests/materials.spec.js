const { test, expect } = require('@playwright/test');

test.describe('Catalogo central de materiales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modules/calculadora/?reset');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('convierte la presentacion comprada a una unidad de uso', async ({ page }) => {
    const material = await page.evaluate(() => AppMaterials.normalize({
      id: 'harina', nombre: 'Harina 000', cantidadPresentacion: 1,
      unidadPresentacion: 'kg', precioCompra: 1500,
    }));
    expect(material.unidadUso).toBe('g');
    expect(material.costoUnidad).toBe(1.5);
  });

  test('crea un material y lo vincula a un insumo', async ({ page }) => {
    await page.getByRole('button', { name: 'Administrar materiales' }).click();
    await page.fill('#material-nombre', 'Harina 000');
    await page.fill('#material-marca', 'Molino Norte');
    await page.fill('#material-cantidad', '1');
    await page.selectOption('#material-unidad', 'kg');
    await page.fill('#material-precio', '1500');
    await page.getByRole('button', { name: 'Guardar material' }).click();

    const id = await page.evaluate(() => AppStorage.getMaterials()[0].id);
    await page.getByRole('button', { name: 'Cerrar' }).click();
    const row = page.locator('#lista-insumos .row-insumo-wrap').first();
    await row.locator('select').selectOption(id);
    await row.locator('input[type="number"]').first().fill('250');
    await expect(page.locator('#total-insumos')).toContainText('375');

    const linked = await page.evaluate(() => leerEstadoCompleto().insumos[0]);
    expect(linked).toMatchObject({ materialId: id, cantidad: 250, precio: 1.5, unidad: 'g' });
  });

  test('actualiza varios productos sin cambiar snapshots de ventas', async ({ page }) => {
    const result = await page.evaluate(() => {
      const material = AppMaterials.normalize({ id: 'harina', nombre: 'Harina', cantidadPresentacion: 1, unidadPresentacion: 'kg', precioCompra: 1000 });
      AppStorage.saveMaterials([material]);
      const ingredient = { materialId: 'harina', nombre: 'Harina', cantidad: 100, precio: 1, unidad: 'g' };
      const base = { unidades: 1, insumos: [ingredient], servicios: [], margen: 50, modo: 'slider' };
      const projects = [{ id: 1, nombre: 'Pan', datos: base }, { id: 2, nombre: 'Torta', datos: { ...base, insumos: [{ ...ingredient, cantidad: 200 }] } }];
      AppStorage.saveProjects(projects);
      const cost = (project) => project.datos.insumos.map((item) => AppMaterials.resolveIngredient(item, AppStorage.getMaterials())).reduce((sum, item) => sum + item.cantidad * item.precio, 0);
      const before = projects.map((project) => ({ costoUnit: cost(project) }));
      const snapshot = { costoUnit: before[0].costoUnit };
      material.precioCompra = 2000;
      AppStorage.saveMaterials([AppMaterials.normalize(material)]);
      const after = AppStorage.getProjects().map((project) => ({ costoUnit: cost(project) }));
      return { before, after, snapshot };
    });
    expect(result.before.map((item) => item.costoUnit)).toEqual([100, 200]);
    expect(result.after.map((item) => item.costoUnit)).toEqual([200, 400]);
    expect(result.snapshot.costoUnit).toBe(100);
  });

  test('incluye el catalogo en el backup y acepta backups anteriores', async ({ page }) => {
    const result = await page.evaluate(() => {
      AppStorage.saveMaterials([AppMaterials.normalize({ id: 'frasco', nombre: 'Frasco', cantidadPresentacion: 12, unidadPresentacion: 'u', precioCompra: 6000 })]);
      const backup = AppStorage.createBackup();
      localStorage.clear();
      AppStorage.restoreBackup(backup);
      const restored = AppStorage.getMaterials();
      AppStorage.restoreBackup({ proyectos: [], actual: null });
      return { backup, restored, afterLegacy: AppStorage.getMaterials() };
    });
    expect(result.backup.version).toBe('6.0');
    expect(result.backup.calculadora_materiales).toHaveLength(1);
    expect(result.restored[0]).toMatchObject({ nombre: 'Frasco', costoUnidad: 500 });
    expect(result.afterLegacy).toHaveLength(1);
  });

  test('la venta conserva el costo aunque luego cambie el material', async ({ page }) => {
    await page.evaluate(() => {
      AppStorage.saveMaterials([AppMaterials.normalize({ id: 'harina', nombre: 'Harina', cantidadPresentacion: 1, unidadPresentacion: 'kg', precioCompra: 1000 })]);
      AppStorage.saveProjects([{ id: 77, nombre: 'Pan', datos: {
        unidades: 1, insumos: [{ materialId: 'harina', nombre: 'Harina', cantidad: 100, precio: 1, unidad: 'g' }],
        servicios: [], margen: 50, modo: 'slider', gastosMensuales: 0, diasLaborales: 24,
      } }]);
    });
    await page.goto('/modules/registrodeventas/');
    await page.selectOption('#select-producto', '77');
    await page.click('#btn-agregar');
    await page.click('#btn-finalizar');

    const result = await page.evaluate(() => {
      const saleBefore = AppStorage.getSales()[0];
      const material = AppStorage.getMaterials()[0];
      material.precioCompra = 2000;
      AppStorage.saveMaterials([AppMaterials.normalize(material)]);
      const currentProjectCost = calcDesdeProyecto(AppStorage.getProjects()[0]).costoUnit;
      return { snapshotCost: saleBefore.totalCosto, currentProjectCost };
    });
    expect(result.snapshotCost).toBe(100);
    expect(result.currentProjectCost).toBe(200);
  });
});
