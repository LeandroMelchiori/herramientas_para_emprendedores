const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/privacidad.html');
});

test('privacidad: índice, salto al contenido y regreso funcionan con teclado', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  for (const id of ['que-medimos', 'que-no-hacemos', 'como-lo-hacemos', 'datos-guardados']) {
    const link = page.locator(`.privacy-index a[href="#${id}"]`);
    await link.focus();
    await link.press('Enter');
    await expect(page.locator(`#${id}`)).toBeFocused();
    expect(await page.locator(`#${id}`).evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
  }
  await page.getByRole('link', { name: 'Volver arriba' }).click();
  await expect(page).toHaveURL(/#inicio$/);
  await page.getByRole('link', { name: 'Todas las herramientas' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('privacidad: lectura adaptable, contraste y ampliación de texto', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 375, 812, 1440]) {
    await page.setViewportSize({ width, height: width === 812 ? 375 : 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('main p').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    for (const link of await page.locator('.privacy-index a, .back-link').all()) {
      expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
  }
  // Textos secundarios y enlaces se comparan contra su superficie real, no solo contra blanco.
  const ratios = await page.evaluate(() => {
    const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = color => rgb(color).map(v => {
      const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
    return [...document.querySelectorAll('main p, main li, .updated, .eyebrow, footer, .privacy-index a')].map(el => {
      let bg = el;
      while (getComputedStyle(bg).backgroundColor === 'rgba(0, 0, 0, 0)' && bg.parentElement) bg = bg.parentElement;
      const a = luminance(getComputedStyle(el).color), b = luminance(getComputedStyle(bg).backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
  });
  ratios.forEach(ratio => expect(ratio).toBeGreaterThanOrEqual(4.5));
  await page.setViewportSize({ width: 375, height: 900 });
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('privacidad: contenido visible sin contacto provisional e impresión sin navegación', async ({ page }) => {
  await expect(page.locator('main section')).toHaveCount(4);
  await expect(page.locator('#datos-guardados + p')).toContainText('únicamente en tu dispositivo');
  await expect(page.locator('time')).toHaveAttribute('datetime', '2026-06');
  await expect(page.locator('.privacy-index a')).toHaveCount(4);
  await expect(page.locator('#contacto, a[href="#contacto"], a[href*="instagram.com"], a[href^="mailto:"]')).toHaveCount(0);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.privacy-index')).toBeHidden();
  await expect(page.locator('#datos-guardados')).toBeVisible();
});
