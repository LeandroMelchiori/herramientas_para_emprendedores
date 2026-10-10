const { test, expect } = require('@playwright/test');

test.describe('Aceptacion del catalogo de materiales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modules/calculadora/?reset');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('calcula correctamente volumen, longitud y unidades', async ({ page }) => {
    const result = await page.evaluate(() => [
      AppMaterials.normalize({ nombre: 'Aceite', cantidadPresentacion: 2, unidadPresentacion: 'l', precioCompra: 3600 }),
      AppMaterials.normalize({ nombre: 'Cinta', cantidadPresentacion: 5, unidadPresentacion: 'm', precioCompra: 2500 }),
      AppMaterials.normalize({ nombre: 'Frasco', cantidadPresentacion: 12, unidadPresentacion: 'u', precioCompra: 6000 }),
    ]);

    expect(result[0]).toMatchObject({ unidadUso: 'ml', costoUnidad: 1.8 });
    expect(result[1]).toMatchObject({ unidadUso: 'cm', costoUnidad: 5 });
    expect(result[2]).toMatchObject({ unidadUso: 'u', costoUnidad: 500 });
  });

  test('muestra perdida cuando el precio manual es inferior al costo', async ({ page }) => {
    await page.evaluate(() => AppStorage.saveProjects([{
      id: 301,
      nombre: 'Producto en perdida',
      fecha: '26/09/2026',
      datos: {
        unidades: 1,
        insumos: [{ nombre: 'Material', cantidad: 1, precio: 1000 }],
        servicios: [],
        modo: 'precio',
        precioManual: 800,
      },
    }]));
    await page.reload();
    await page.locator('.nav-tab').nth(4).click();

    const preview = page.locator('.proyecto-preview');
    await expect(preview).toContainText('Costo: 125%');
    await expect(preview).toContainText('Pérdida: 25%');
    await expect(preview.locator('.proyecto-composicion')).toHaveClass(/has-loss/);
  });

  test('restaura catalogo y referencias de productos en un almacenamiento limpio', async ({ page }) => {
    const result = await page.evaluate(() => {
      const material = AppMaterials.normalize({
        id: 'frasco-demo',
        nombre: 'Frasco 250 ml',
        cantidadPresentacion: 12,
        unidadPresentacion: 'u',
        precioCompra: 6000,
      });
      AppStorage.saveMaterials([material]);
      AppStorage.saveProjects([{
        id: 401,
        nombre: 'Mermelada',
        datos: {
          unidades: 1,
          insumos: [{ materialId: material.id, nombre: material.nombre, cantidad: 1, precio: 500, unidad: 'u' }],
          servicios: [],
          margen: 50,
          modo: 'slider',
        },
      }]);
      const backup = AppStorage.createBackup();

      localStorage.clear();
      AppStorage.restoreBackup(backup);
      const restoredProject = AppStorage.getProjects()[0];
      const summary = resumirProyecto(restoredProject);
      return {
        backupVersion: backup.version,
        material: AppStorage.getMaterials()[0],
        materialId: restoredProject.datos.insumos[0].materialId,
        summary,
      };
    });

    expect(result.backupVersion).toBe('6.0');
    expect(result.material).toMatchObject({ id: 'frasco-demo', costoUnidad: 500 });
    expect(result.materialId).toBe('frasco-demo');
    expect(result.summary).toMatchObject({ cost: 500, salePrice: 750 });
  });
});
