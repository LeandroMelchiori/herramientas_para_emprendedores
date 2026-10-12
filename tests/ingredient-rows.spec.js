const { test, expect } = require('@playwright/test');

const variants = [
  { id: 'mayo250', nombre: 'Mayonesa', marca: 'Del Sol', cantidadPresentacion: 250, unidadPresentacion: 'g', precioCompra: 1500 },
  { id: 'mayo500', nombre: 'Mayonesa', marca: 'Del Sol', cantidadPresentacion: 0.5, unidadPresentacion: 'kg', precioCompra: 2500 },
];
const row = page => page.locator('#lista-insumos .ingredient-row').first();
const state = page => page.evaluate(() => leerEstadoCompleto().insumos[0]);
async function select(page) {
  await row(page).getByRole('combobox').fill('Mayo');
  await row(page).getByRole('option', { name: /250 g/ }).click();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/modules/calculadora/');
  await page.evaluate(data => { localStorage.clear(); AppStorage.saveMaterials(data); }, variants);
  await page.reload();
});

test('fila compacta: nombre, cantidad, costo y total; sin campos adicionales', async ({ page }) => {
  await expect(row(page).locator('input')).toHaveCount(3);
  await expect(row(page).locator('select, details, .ingredient-result')).toHaveCount(0);
  await row(page).getByRole('combobox').fill('Harina Pureza — 1 kg');
  await row(page).getByLabel('Cantidad', { exact: true }).fill('0.25');
  await row(page).getByLabel('Costo unitario', { exact: true }).fill('1500');
  await expect(row(page).getByLabel('Total del material')).toContainText('375');
  await expect(page.locator('#total-insumos')).toContainText('375');
  await row(page).getByRole('button', { name: 'Guardar material', exact: true }).click();
  const saved = await state(page);
  expect(saved).toMatchObject({ cantidad: 0.25, precio: 1500, nombre: 'Harina Pureza — 1 kg' });
  expect(saved.materialId).toBeTruthy();
  await page.waitForTimeout(650);
  await page.reload();
  await expect(row(page).getByLabel('Total del material')).toContainText('375');
  expect(await page.evaluate(() => AppStorage.getMaterials()[0].costoUnidad)).toBe(1500);
});

test('materiales anteriores conservan medida, cantidad y costo al seleccionarlos', async ({ page }) => {
  await select(page);
  await expect(row(page).getByRole('combobox')).toHaveValue(/Del Sol.*250 g.*por g/);
  await row(page).getByLabel('Cantidad', { exact: true }).fill('50');
  await expect(row(page).getByLabel('Total del material')).toContainText('300');
  await expect(row(page).getByRole('combobox')).toHaveAttribute('readonly', '');
  await expect(row(page).getByLabel('Costo unitario', { exact: true })).toHaveAttribute('readonly', '');
  expect(await state(page)).toMatchObject({ materialId: 'mayo250', cantidad: 50, precio: 6, unidad: 'g' });
});

test('cancelar mantiene vínculo; editar nombre o costo desvincula sin cambiar catálogo', async ({ page }) => {
  await select(page);
  await row(page).getByRole('button', { name: 'Editar', exact: true }).click();
  await row(page).getByRole('button', { name: 'Editar solo acá' }).click();
  expect((await state(page)).materialId).toBe('mayo250');
  await row(page).getByRole('button', { name: 'Cancelar edición' }).click();
  expect((await state(page)).materialId).toBe('mayo250');
  await row(page).getByRole('button', { name: 'Editar', exact: true }).click();
  await row(page).getByRole('button', { name: 'Editar solo acá' }).click();
  await row(page).getByLabel('Costo unitario', { exact: true }).fill('7');
  await expect(row(page).locator('.ingredient-status')).toContainText('Desvinculado');
  expect(await state(page)).toMatchObject({ materialId: null, precio: 7 });
  expect(await page.evaluate(() => AppStorage.getMaterials()[0].costoUnidad)).toBe(6);
  await row(page).getByRole('combobox').fill('Otra mayonesa — por g');
  await page.waitForTimeout(650);
  await page.reload();
  expect(await state(page)).toMatchObject({ materialId: null, desvinculado: true, precio: 7, nombre: 'Otra mayonesa — por g' });
});

test('autocomplete mantiene variantes y selección con teclado', async ({ page }) => {
  const input = row(page).getByRole('combobox');
  await input.fill('Mayo');
  await expect(row(page).locator('.material-suggestions').getByRole('option')).toHaveCount(2);
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await input.press('Enter');
  expect(await state(page)).toMatchObject({ materialId: 'mayo500', precio: 5, unidad: 'g' });
});

test('catálogo evita duplicados por nombre sin interpretar medidas escritas', async ({ page }) => {
  await page.getByRole('button', { name: 'Administrar materiales' }).click();
  await page.fill('#material-nombre', 'Hilo — 1 metro');
  await page.fill('#material-precio', '100');
  await page.getByRole('button', { name: 'Guardar material', exact: true }).click();
  await page.fill('#material-nombre', ' hilo — 1 metro ');
  await page.fill('#material-precio', '200');
  await page.getByRole('button', { name: 'Guardar material', exact: true }).click();
  await expect(page.locator('#material-form-error')).toContainText('ya está guardado');
  expect(await page.evaluate(() => AppStorage.getMaterials().length)).toBe(3);
  await expect(page.locator('#material-marca, #material-unidad, #material-cantidad')).toHaveCount(0);
});

test('edición central pide confirmación y conserva base de cálculo anterior', async ({ page }) => {
  await select(page);
  await page.evaluate(() => AppStorage.saveProjects([{ id: 1, datos: { insumos: [{ ...estado.insumos[0] }] } }]));
  await row(page).getByRole('button', { name: 'Editar', exact: true }).click();
  await row(page).getByRole('button', { name: 'Editar en catálogo' }).click();
  await expect(page.locator('#material-precio')).toHaveValue('6');
  await page.fill('#material-precio', '8');
  let message;
  page.once('dialog', async dialog => { message = dialog.message(); await dialog.dismiss(); });
  await page.getByRole('button', { name: 'Guardar material', exact: true }).click();
  expect(message).toContain('1 proyecto(s)');
  expect(await page.evaluate(() => AppStorage.getMaterials()[0].costoUnidad)).toBe(6);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Guardar material', exact: true }).click();
  expect(await state(page)).toMatchObject({ precio: 8, unidad: 'g', materialId: 'mayo250' });
  expect(await page.evaluate(() => AppStorage.getMaterials()[1].costoUnidad)).toBe(5);
});

test('datos antiguos conservan valores y campos desconocidos al recargar', async ({ page }) => {
  const legacy = { nombre: 'Harina', cantidad: 2, precio: 1500, anotacion: 'propia' };
  await page.evaluate(item => { aplicarEstado({ _schema: 2, insumos: [item], servicios: [], unidades: 1 }); renderizarFilas(); actualizar(); }, legacy);
  expect(await state(page)).toEqual(legacy);
  await page.waitForTimeout(650);
  await page.reload();
  expect(await state(page)).toEqual(legacy);
  expect(await page.evaluate(() => AppStorage.createBackup().calculadora_autosave.insumos[0])).toEqual(legacy);
});

test('presentación manual anterior conserva costo sin recalcular al editar', async ({ page }) => {
  await page.evaluate(() => {
    estado.insumos = [{ nombre: 'Harina', cantidad: 250, precio: 1.5, presentacionActiva: true,
      cantidadPresentacion: 1, unidadPresentacion: 'kg', precioCompra: 1500, unidad: 'g', nota: 'conservar' }];
    renderizarFilas(); actualizar();
  });
  await expect(row(page).getByLabel('Total del material')).toContainText('375');
  await row(page).getByLabel('Costo unitario', { exact: true }).fill('2');
  expect(await state(page)).toMatchObject({ precio: 2, cantidad: 250, precioCompra: 1500, nota: 'conservar' });
  await expect(row(page).getByLabel('Total del material')).toContainText('500');
});

test('sin desbordes en móvil, horizontal y escritorio', async ({ page }) => {
  await select(page);
  for (const size of [{ width: 375, height: 812 }, { width: 812, height: 375 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(size);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('fallo al guardar no vincula ni anuncia un material inexistente', async ({ page }) => {
  await select(page);
  await row(page).getByRole('button', { name: 'Editar', exact: true }).click();
  await row(page).getByRole('button', { name: 'Editar solo acá' }).click();
  await row(page).getByRole('combobox').fill('Nueva mayonesa — por g');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === AppStorage.KEYS.materials) throw new DOMException('Sin espacio', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await row(page).getByRole('button', { name: 'Guardar material', exact: true }).click();
  await expect(row(page).locator('.ingredient-error')).toContainText('No se pudo guardar');
  expect((await state(page)).materialId).toBeNull();
});

test('Escape devuelve foco y material ausente conserva costo', async ({ page }) => {
  await select(page);
  await row(page).getByRole('button', { name: 'Editar', exact: true }).click();
  await row(page).getByRole('button', { name: 'Editar en catálogo' }).click();
  await page.keyboard.press('Escape');
  await expect(row(page).getByRole('button', { name: 'Editar', exact: true })).toBeFocused();
  await page.evaluate(() => { AppStorage.saveMaterials([]); window.dispatchEvent(new CustomEvent('materials:changed')); });
  await expect(row(page).locator('.ingredient-status')).toContainText('No disponible');
  expect((await state(page)).precio).toBe(6);
});

test('Editar revela opciones sin desbloquear y admite teclado, Escape y cierre exterior', async ({ page }) => {
  await select(page);
  const trigger = row(page).getByRole('button', { name: 'Editar', exact: true });
  const choices = row(page).getByRole('group', { name: 'Opciones de edición' });
  await expect(choices).toBeHidden();
  await expect(row(page).locator('.ingredient-actions button:visible')).toHaveCount(1);
  await trigger.focus();
  await trigger.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(row(page).getByRole('combobox')).toHaveAttribute('readonly', '');
  expect((await state(page)).materialId).toBe('mayo250');
  await page.keyboard.press('Tab');
  await expect(row(page).getByRole('button', { name: 'Editar solo acá' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(choices).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await row(page).getByRole('button', { name: 'Editar solo acá' }).focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(choices).toBeHidden();
  for (const width of [375, 812, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await trigger.click();
    await expect(choices).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#nombre-producto').click();
    await expect(choices).toBeHidden();
  }
});
