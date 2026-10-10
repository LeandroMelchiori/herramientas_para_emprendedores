const { test, expect } = require('@playwright/test');

for (const module of ['guiadeprompts', 'herramientasdigitales']) {
  test(module + ': contenido visible, búsqueda y favoritos', async ({ page }) => {
    const ai = module === 'guiadeprompts';
    await page.goto('/modules/' + module + '/');
    const cards = page.locator(ai ? '.prompt-card' : '.tool-card');
    const content = cards.first().locator(ai ? '.prompt-sections' : '.tool-desc');
    await expect(content).toBeVisible();
    await expect(page.locator('.library-details')).toHaveCount(0);
    await cards.first().locator('.fav-btn').click();
    await page.reload();
    await expect(cards.first().locator('.fav-btn')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#search-input').fill('zzzz_no_existe');
    await expect(cards.first()).toBeHidden();
    await page.locator('#search-input').fill('');
    await expect(content).toBeVisible();
    for (const viewport of [{width:375,height:812}, {width:812,height:375}, {width:1440,height:900}]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test('IA: copiar todas las partes y cerrar categorías con Escape', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/modules/guiadeprompts/');
  await page.locator('.copy-btn').first().click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  for (const section of ['ROL', 'CONTEXTO', 'TAREA', 'FORMATO', 'TONO']) expect(copied).toContain('## ' + section);
  await page.locator('#filter-toggle').click();
  await expect(page.locator('#filter-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#filter-panel')).toBeHidden();
  await expect(page.locator('#filter-toggle')).toBeFocused();
});
