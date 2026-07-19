const { test, expect } = require('@playwright/test');

test.describe('Registro de Ventas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const productos = [
        {
          id: 1,
          nombre: "Alfajores de Maicena",
          costo_total: 100,
          precio_sugerido: 200,
          margen: 50
        }
      ];
      localStorage.setItem('calculadora_proyectos', JSON.stringify(productos));
      localStorage.setItem('ventas_historial', '[]');
    });
  });

  test('debería poder registrar una venta con etiqueta y fiado y mostrarse en el historial', async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    
    // Seleccionar producto y agregarlo al carrito
    await page.selectOption('#select-producto', { index: 1 });
    await page.click('#btn-agregar');

    // Verificar que esté en el carrito
    await expect(page.locator('#lista-carrito')).toContainText('Alfajores de Maicena');

    // Llenar datos de la venta
    await page.fill('#input-precio-final', '200');
    await page.fill('#input-etiqueta', 'Cliente Juan');
    await page.selectOption('#select-pago', 'Transferencia');
    await page.check('#check-fiado');
    await page.click('#btn-finalizar');

    // Debe mostrar toast y vaciarse
    await expect(page.locator('.toast')).toBeVisible();
    await expect(page.locator('#lista-carrito')).toContainText('Todavía no agregaste productos');

    // Ir a pestaña historial
    await page.click('button.nav-tab:has-text("Historial")');

    // Verificar desglose en resumen (Fiado / A cobrar)
    const resumen = page.locator('#resumen-periodo');
    await expect(resumen).toContainText('A cobrar:');
    await expect(resumen).toContainText('200');

    // Verificar item de venta en la lista
    const itemVenta = page.locator('.venta-item').first();
    await expect(itemVenta).toContainText('Cliente Juan');
    await expect(itemVenta).toContainText('FIADO');
    await expect(itemVenta).toContainText('200');
  });

  test('debería registrar un pago normal en efectivo', async ({ page }) => {
    await page.goto('/modules/registrodeventas/');
    
    // Seleccionar producto
    await page.selectOption('#select-producto', { index: 1 });
    await page.click('#btn-agregar');

    // Editar precio final cobrado
    await page.fill('#input-precio-final', '250');
    await page.selectOption('#select-pago', 'Efectivo');
    await page.click('#btn-finalizar');

    await page.click('button.nav-tab:has-text("Historial")');

    // Resumen general
    const resumen = page.locator('#resumen-periodo');
    await expect(resumen).toContainText('Efectivo:');
    await expect(resumen).toContainText('250');

    // Lista
    const itemVenta = page.locator('.venta-item').first();
    await expect(itemVenta).toContainText('EFECTIVO');
    await expect(itemVenta).toContainText('250');
  });
});
