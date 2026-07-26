/* Normaliza datos históricos sin eliminar campos que versiones anteriores hayan guardado. */
(function initMigrations(global) {
  'use strict';

  const SCHEMA_VERSION = 5;
  const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  function normalizeProject(project) {
    if (!isObject(project)) return null;
    const data = isObject(project.datos) ? project.datos : project;
    return {
      ...project,
      id: project.id ?? Date.now(),
      nombre: project.nombre || data.nombreProducto || project.nombreProducto || 'Producto sin nombre',
      datos: isObject(project.datos) ? { ...project.datos } : { ...data },
    };
  }

  function normalizeSaleItem(item) {
    if (!isObject(item)) return null;
    const cantidad = Math.max(1, finite(item.cantidad, 1));
    const precioUnit = finite(item.precioUnit);
    const costoUnit = finite(item.costoUnit);
    return {
      ...item,
      productoNombre: item.productoNombre || 'Producto sin nombre',
      cantidad,
      precioUnit,
      costoUnit,
      gananciaUnit: finite(item.gananciaUnit, precioUnit - costoUnit),
      subtotal: finite(item.subtotal, precioUnit * cantidad),
      costoTotal: finite(item.costoTotal, costoUnit * cantidad),
      gananciaTotal: finite(item.gananciaTotal, (precioUnit - costoUnit) * cantidad),
    };
  }

  function normalizePayment(payment, fallbackDate, fallbackMethod) {
    if (!isObject(payment)) return null;
    return {
      ...payment,
      id: payment.id ?? Date.now(),
      fecha: payment.fecha || fallbackDate || new Date().toISOString(),
      monto: Math.max(0, finite(payment.monto)),
      medio: payment.medio || fallbackMethod || 'Efectivo',
      origen: payment.origen || 'pago_historico',
    };
  }

  function normalizeSale(sale) {
    if (!isObject(sale)) return null;
    const items = Array.isArray(sale.items) ? sale.items.map(normalizeSaleItem).filter(Boolean) : [];
    const suggested = finite(sale.totalSugerido, items.reduce((sum, item) => sum + item.subtotal, 0));
    const cost = finite(sale.totalCosto, items.reduce((sum, item) => sum + item.costoTotal, 0));
    const charged = finite(sale.totalCobrado, suggested);
    const paid = finite(sale.montoPagado, sale.fiado ? 0 : charged);
    const normalizedPaid = Math.min(Math.max(paid, 0), charged);
    const pagos = Array.isArray(sale.pagos)
      ? sale.pagos.map(payment => normalizePayment(payment, sale.fecha, sale.medioPago)).filter(Boolean)
      : normalizedPaid > 0 ? [{
          id: sale.id ?? Date.now(), fecha: sale.fecha || new Date().toISOString(),
          monto: normalizedPaid, medio: sale.medioPago || 'Efectivo', origen: 'migracion_historica',
        }] : [];
    return {
      ...sale,
      id: sale.id ?? Date.now(),
      fecha: sale.fecha || new Date().toISOString(),
      items,
      totalSugerido: suggested,
      totalCobrado: charged,
      montoPagado: normalizedPaid,
      totalCosto: cost,
      totalGanancia: finite(sale.totalGanancia, charged - cost),
      descuento: finite(sale.descuento, Math.max(suggested - charged, 0)),
      etiqueta: sale.etiqueta || '',
      medioPago: sale.medioPago || 'Efectivo',
      fiado: Boolean(sale.fiado ?? normalizedPaid < charged),
      pagos,
      anulada: Boolean(sale.anulada),
      anuladaFecha: sale.anuladaFecha || null,
      anuladaMotivo: sale.anuladaMotivo || '',
    };
  }

  function normalizeExpense(expense) {
    if (!isObject(expense)) return null;
    return {
      ...expense,
      id: expense.id ?? Date.now(),
      fecha: expense.fecha || new Date().toISOString(),
      concepto: expense.concepto || 'Gasto sin concepto',
      categoria: expense.categoria || 'Otros',
      monto: Math.max(0, finite(expense.monto)),
      medioPago: expense.medioPago || 'Efectivo',
      recurrenteMensual: Boolean(expense.recurrenteMensual),
      recurrenteOrigenId: expense.recurrenteOrigenId ?? null,
    };
  }

  function normalizeClosure(closure) {
    if (!isObject(closure) || !closure.mes) return null;
    return { ...closure, id: closure.id || closure.mes, fechaCierre: closure.fechaCierre || new Date().toISOString(), metrics: isObject(closure.metrics) ? { ...closure.metrics } : {} };
  }

  function normalizeList(list, normalizer) {
    if (!Array.isArray(list)) return { value: [], rejected: 1 };
    const value = [];
    let rejected = 0;
    list.forEach((record) => {
      const normalized = normalizer(record);
      if (normalized) value.push(normalized);
      else rejected += 1;
    });
    return { value, rejected };
  }

  global.AppMigrations = Object.freeze({
    SCHEMA_VERSION,
    normalizeProject,
    normalizeSale,
    normalizeProjects: (list) => normalizeList(list, normalizeProject),
    normalizeSales: (list) => normalizeList(list, normalizeSale),
    normalizeExpenses: (list) => normalizeList(list, normalizeExpense),
    normalizeClosures: (list) => normalizeList(list, normalizeClosure),
  });
})(window);
