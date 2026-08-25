/* Reglas puras del catalogo: convierte presentaciones de compra a unidades de uso. */
(function initMaterialsDomain(global) {
  'use strict';

  const UNITS = Object.freeze({
    kg: { base: 'g', factor: 1000, label: 'kg' },
    g:  { base: 'g', factor: 1, label: 'g' },
    l:  { base: 'ml', factor: 1000, label: 'l' },
    ml: { base: 'ml', factor: 1, label: 'ml' },
    m:  { base: 'cm', factor: 100, label: 'm' },
    cm: { base: 'cm', factor: 1, label: 'cm' },
    u:  { base: 'u', factor: 1, label: 'unidad' },
  });

  const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
  const money = (value) => Math.round(number(value) * 1000000) / 1000000;

  function normalize(material) {
    if (!material || typeof material !== 'object') return null;
    const unit = UNITS[material.unidadPresentacion] ? material.unidadPresentacion : 'u';
    const quantity = Math.max(number(material.cantidadPresentacion), 0.000001);
    const price = Math.max(number(material.precioCompra), 0);
    return {
      ...material,
      id: material.id || global.crypto?.randomUUID?.() || `material-${Date.now()}`,
      nombre: String(material.nombre || '').trim(),
      marca: String(material.marca || '').trim(),
      categoria: String(material.categoria || 'Otros'),
      cantidadPresentacion: quantity,
      unidadPresentacion: unit,
      unidadUso: UNITS[unit].base,
      precioCompra: price,
      costoUnidad: money(price / (quantity * UNITS[unit].factor)),
      activo: material.activo !== false,
      actualizadoEn: material.actualizadoEn || new Date().toISOString(),
      historialPrecios: Array.isArray(material.historialPrecios) ? material.historialPrecios : [],
    };
  }

  function resolveIngredient(ingredient, materials) {
    if (!ingredient?.materialId) return { ...ingredient };
    const material = materials.map(normalize).find((item) => item?.id === ingredient.materialId);
    if (!material) return { ...ingredient, materialNoEncontrado: true };
    return {
      ...ingredient,
      nombre: material.marca ? `${material.nombre} - ${material.marca}` : material.nombre,
      precio: material.costoUnidad,
      unidad: material.unidadUso,
      materialNoEncontrado: false,
    };
  }

  global.AppMaterials = Object.freeze({ UNITS, normalize, resolveIngredient });
})(window);
