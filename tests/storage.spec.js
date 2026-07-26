const { test, expect } = require('@playwright/test');

test.describe('Contrato compartido de almacenamiento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/modules/calculadora/');
    await page.evaluate(() => localStorage.clear());
  });

  test('restaura un backup completo sin conservar datos viejos', async ({ page }) => {
    const result = await page.evaluate(() => {
      AppStorage.saveProjects([{ id: 1, nombre: 'Producto demo', datos: {} }]);
      AppStorage.saveSales([{ id: 2, fecha: new Date().toISOString(), items: [] }]);
      AppStorage.writeJson(AppStorage.KEYS.promptFavorites, ['prompt-1']);
      AppStorage.writeJson(AppStorage.KEYS.savedPalettes, ['#112233']);
      const backup = AppStorage.createBackup();

      localStorage.clear();
      AppStorage.saveCalculatorDraft({ nombreProducto: 'Borrador viejo' });
      AppStorage.writeJson(AppStorage.KEYS.toolFilter, { cat: 'viejo' });
      AppStorage.restoreBackup(backup);

      return {
        backup,
        projects: AppStorage.getProjects(),
        sales: AppStorage.getSales(),
        draft: AppStorage.getCalculatorDraft(),
        promptFavorites: AppStorage.readJson(AppStorage.KEYS.promptFavorites, []),
        palettes: AppStorage.readJson(AppStorage.KEYS.savedPalettes, []),
        toolFilter: AppStorage.readJson(AppStorage.KEYS.toolFilter, null),
      };
    });

    expect(result.backup.version).toBe('2.0');
    expect(result.projects).toHaveLength(1);
    expect(result.sales).toHaveLength(1);
    expect(result.draft).toBeNull();
    expect(result.promptFavorites).toEqual(['prompt-1']);
    expect(result.palettes).toEqual(['#112233']);
    expect(result.toolFilter).toBeNull();
  });

  test('mantiene compatibilidad con backups antiguos', async ({ page }) => {
    const result = await page.evaluate(() => {
      AppStorage.restoreBackup({
        proyectos: [{ id: 3, nombre: 'Formato anterior', datos: {} }],
        actual: { nombreProducto: 'Trabajo anterior' },
      });
      return {
        projects: AppStorage.getProjects(),
        draft: AppStorage.getCalculatorDraft(),
      };
    });

    expect(result.projects[0].nombre).toBe('Formato anterior');
    expect(result.draft.nombreProducto).toBe('Trabajo anterior');
  });
});
