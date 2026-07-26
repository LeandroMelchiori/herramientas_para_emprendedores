/* Reglas puras del registro de ventas, independientes de la interfaz y localStorage. */
(function initSalesDomain(global) {
  'use strict';

  const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

  function createItem(project, quantity = 1) {
    const result = AppCosting.fromProject(project);
    const data = project.datos || project;
    const cantidad = Math.max(parseInt(quantity, 10) || 1, 1);
    const precioUnit = roundMoney(result.precioVenta);
    const costoUnit = roundMoney(result.costoUnitario);
    const gananciaUnit = roundMoney(precioUnit - costoUnit);
    return {
      productoId: project.id,
      productoNombre: project.nombre || data.nombreProducto || project.nombreProducto || `Producto #${project.id}`,
      cantidad,
      precioUnit,
      costoUnit,
      gananciaUnit,
      subtotal: roundMoney(precioUnit * cantidad),
      costoTotal: roundMoney(costoUnit * cantidad),
      gananciaTotal: roundMoney(gananciaUnit * cantidad),
    };
  }

  function updateQuantity(item, quantity) {
    const cantidad = Math.max(parseInt(quantity, 10) || 1, 1);
    return {
      ...item,
      cantidad,
      subtotal: roundMoney(item.precioUnit * cantidad),
      costoTotal: roundMoney(item.costoUnit * cantidad),
      gananciaTotal: roundMoney(item.gananciaUnit * cantidad),
    };
  }

  function summarize(items, finalPrice) {
    const totalSugerido = roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0));
    const totalCosto = roundMoney(items.reduce((sum, item) => sum + item.costoTotal, 0));
    const totalCobrado = finalPrice === undefined ? totalSugerido : Math.max(roundMoney(finalPrice), 0);
    return {
      totalSugerido,
      totalCosto,
      totalCobrado,
      totalGanancia: roundMoney(totalCobrado - totalCosto),
      descuento: roundMoney(Math.max(totalSugerido - totalCobrado, 0)),
    };
  }

  function createSale({ items, finalPrice, label = '', paymentMethod = 'Efectivo', credit = false, deposit = 0, now = new Date() }) {
    const snapshot = items.map((item) => ({ ...item }));
    const totals = summarize(snapshot, finalPrice);
    const montoPagado = credit
      ? Math.min(Math.max(roundMoney(deposit), 0), totals.totalCobrado)
      : totals.totalCobrado;
    const pagos = montoPagado > 0 ? [{
      id: now.getTime(),
      fecha: now.toISOString(),
      monto: montoPagado,
      medio: paymentMethod,
      origen: credit ? 'sena_inicial' : 'pago_inicial',
    }] : [];
    return {
      id: now.getTime(),
      fecha: now.toISOString(),
      items: snapshot,
      ...totals,
      montoPagado,
      etiqueta: label.trim(),
      medioPago: paymentMethod,
      fiado: montoPagado < totals.totalCobrado,
      pagos,
    };
  }

  function outstanding(sale) {
    return roundMoney(Math.max(0, (Number(sale.totalCobrado) || 0) - (Number(sale.montoPagado) || 0)));
  }

  function applyPayment(sale, amount, paymentMethod, now = new Date()) {
    const totalCobrado = Number(sale.totalCobrado) || 0;
    const applied = Math.min(outstanding(sale), Math.max(0, roundMoney(amount)));
    if (!applied) return { ...sale };
    const montoPagado = roundMoney((Number(sale.montoPagado) || 0) + applied);
    const pagos = [...(sale.pagos || []), {
      id: now.getTime(),
      fecha: now.toISOString(),
      monto: applied,
      medio: paymentMethod || 'Efectivo',
      origen: 'cobro_pendiente',
    }];
    return { ...sale, montoPagado, fiado: montoPagado < totalCobrado, medioPago: paymentMethod || sale.medioPago || 'Efectivo', pagos };
  }

  global.AppSales = Object.freeze({ createItem, updateQuantity, summarize, createSale, outstanding, applyPayment });
})(window);
