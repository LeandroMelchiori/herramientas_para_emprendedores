/* Reglas puras del catalogo: convierte presentaciones de compra a unidades de uso. */
(function initMaterialsDomain(global) {
  'use strict';

  const UNITS = Object.freeze({
    kg: { base: 'g', factor: 1000, label: 'kg', name: 'Kilogramo' },
    g:  { base: 'g', factor: 1, label: 'g', name: 'Gramo' },
    l:  { base: 'ml', factor: 1000, label: 'l', name: 'Litro' },
    ml: { base: 'ml', factor: 1, label: 'ml', name: 'Mililitro' },
    m:  { base: 'cm', factor: 100, label: 'm', name: 'Metro' },
    cm: { base: 'cm', factor: 1, label: 'cm', name: 'Centímetro' },
    u:  { base: 'u', factor: 1, label: 'u', name: 'Unidad' },
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
      unidadUso: material.calculoDirecto ? (material.unidadUso || 'u') : UNITS[unit].base,
      precioCompra: price,
      costoUnidad: material.calculoDirecto ? Math.max(number(material.costoDirecto), 0) : money(price / (quantity * UNITS[unit].factor)),
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
      nombreMaterial: material.nombre,
      marca: material.marca,
      cantidadPresentacion: material.cantidadPresentacion,
      unidadPresentacion: material.unidadPresentacion,
      precioCompra: material.precioCompra,
      calculoDirecto: Boolean(material.calculoDirecto),
      presentacionActiva: !material.calculoDirecto,
      precio: material.costoUnidad,
      unidad: material.unidadUso,
      materialNoEncontrado: false,
    };
  }

  const textKey = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es').replace(/\s+/g, ' ');

  // Compara contenido real: medio kilogramo y 500 gramos son la misma presentación.
  function sameVariant(a, b) {
    if (a.calculoDirecto || b.calculoDirecto) return textKey(materialLabel(a)) === textKey(materialLabel(b));
    const ua = UNITS[a.unidadPresentacion], ub = UNITS[b.unidadPresentacion];
    return Boolean(ua && ub && textKey(a.nombreMaterial || a.nombre) === textKey(b.nombreMaterial || b.nombre)
      && textKey(a.marca) === textKey(b.marca) && ua.base === ub.base
      && Math.abs(number(a.cantidadPresentacion) * ua.factor - number(b.cantidadPresentacion) * ub.factor) < 0.000001);
  }

  function validPresentation(item) {
    return Boolean(UNITS[item.unidadPresentacion] && number(item.cantidadPresentacion) > 0 && number(item.precioCompra) > 0);
  }

  // Explicita medidas antiguas en el nombre sin convertir cantidades ni costos guardados.
  function materialLabel(item) {
    if (item.calculoDirecto) return item.nombre;
    const name = item.nombreMaterial || item.nombre || '';
    const brand = item.marca ? ` - ${item.marca}` : '';
    const size = item.cantidadPresentacion && item.unidadPresentacion ? ` · ${item.cantidadPresentacion} ${item.unidadPresentacion}` : '';
    const base = item.unidadUso || item.unidad;
    return name + brand + size + (base ? ` (por ${base})` : '');
  }
  function ingredientLabel(item) {
    return item.presentacionActiva ? materialLabel(item) : item.nombre || '';
  }
  global.AppMaterials = Object.freeze({ UNITS, normalize, resolveIngredient, sameVariant, validPresentation, textKey, materialLabel, ingredientLabel });
})(window);
