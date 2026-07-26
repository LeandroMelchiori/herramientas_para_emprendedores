/* Normaliza datos históricos sin eliminar campos que versiones anteriores hayan guardado. */
(function initMigrations(global) {
  'use strict';

  const SCHEMA_VERSION = 3;
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

  function normalizeSale(sale) {
    if (!isObject(sale)) return null;
    const items = Array.isArray(sale.items) ? sale.items.map(normalizeSaleItem).filter(Boolean) : [];
    const suggested = finite(sale.totalSugerido, items.reduce((sum, item) => sum + item.subtotal, 0));
    const cost = finite(sale.totalCosto, items.reduce((sum, item) => sum + item.costoTotal, 0));
    const charged = finite(sale.totalCobrado, suggested);
    const paid = finite(sale.montoPagado, sale.fiado ? 0 : charged);
    return {
      ...sale,
      id: sale.id ?? Date.now(),
      fecha: sale.fecha || new Date().toISOString(),
      items,
      totalSugerido: suggested,
      totalCobrado: charged,
      montoPagado: Math.min(Math.max(paid, 0), charged),
      totalCosto: cost,
      totalGanancia: finite(sale.totalGanancia, charged - cost),
      descuento: finite(sale.descuento, Math.max(suggested - charged, 0)),
      etiqueta: sale.etiqueta || '',
      medioPago: sale.medioPago || 'Efectivo',
      fiado: Boolean(sale.fiado ?? paid < charged),
    };
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
  });
})(window);
