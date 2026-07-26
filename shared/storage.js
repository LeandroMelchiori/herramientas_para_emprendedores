/* ============================================================
   shared/storage.js - Contrato unico para los datos persistentes.
   Centraliza claves, validacion basica y compatibilidad de backups.
   ============================================================ */

(function initStorage(global) {
  'use strict';

  const KEYS = Object.freeze({
    projects: 'calculadora_proyectos',
    calculatorDraft: 'calculadora_autosave',
    sales: 'ventas_historial',
    backupLast: 'backup_ultimo',
    backupSnoozedUntil: 'backup_pospuesto_hasta',
    promptFavorites: 'gp_favs',
    customPrompts: 'gp_mine',
    lastColor: 'cc_last',
    savedPalettes: 'cc_saved',
    toolFavorites: 'hd_favs',
    toolFilter: 'hd_filter',
  });

  function cloneFallback(value) {
    if (Array.isArray(value)) return [...value];
    if (value && typeof value === 'object') return { ...value };
    return value;
  }

  function readJson(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? cloneFallback(fallback) : JSON.parse(raw);
    } catch (error) {
      console.warn(`[Storage] No se pudo leer "${key}".`, error);
      return cloneFallback(fallback);
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[Storage] No se pudo guardar "${key}".`, error);
      global.dispatchEvent(new CustomEvent('app:storage-error', { detail: { key, error } }));
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[Storage] No se pudo eliminar "${key}".`, error);
      return false;
    }
  }

  function getProjects() {
    const projects = readJson(KEYS.projects, []);
    return Array.isArray(projects) ? projects : [];
  }

  function saveProjects(projects) {
    return writeJson(KEYS.projects, Array.isArray(projects) ? projects : []);
  }

  function getSales() {
    const sales = readJson(KEYS.sales, []);
    return Array.isArray(sales) ? sales : [];
  }

  function saveSales(sales) {
    return writeJson(KEYS.sales, Array.isArray(sales) ? sales : []);
  }

  function getCalculatorDraft() {
    const draft = readJson(KEYS.calculatorDraft, null);
    return draft && typeof draft === 'object' && !Array.isArray(draft) ? draft : null;
  }

  function saveCalculatorDraft(draft) {
    return writeJson(KEYS.calculatorDraft, draft);
  }

  function createBackup() {
    return {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      calculadora_proyectos: getProjects(),
      calculadora_autosave: getCalculatorDraft(),
      ventas_historial: getSales(),
      guia_favoritos: readJson(KEYS.promptFavorites, []),
      guia_prompts_propios: readJson(KEYS.customPrompts, []),
      color_estado: readJson(KEYS.lastColor, null),
      color_paletas: readJson(KEYS.savedPalettes, []),
      herramientas_favoritas: readJson(KEYS.toolFavorites, []),
      herramientas_filtro: readJson(KEYS.toolFilter, null),
    };
  }

  /* Acepta el formato actual y el legado { proyectos, actual }. */
  function parseBackup(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new TypeError('El archivo no contiene un backup valido.');
    }

    const own = (key) => Object.prototype.hasOwnProperty.call(data, key);
    const projects = own('calculadora_proyectos') ? data.calculadora_proyectos
      : own('proyectos') ? data.proyectos : undefined;
    const draft = own('calculadora_autosave') ? data.calculadora_autosave
      : own('actual') ? data.actual : undefined;
    const sales = own('ventas_historial') ? data.ventas_historial : undefined;
    const extras = {
      guia_favoritos: [KEYS.promptFavorites, own('guia_favoritos') ? data.guia_favoritos : undefined],
      guia_prompts_propios: [KEYS.customPrompts, own('guia_prompts_propios') ? data.guia_prompts_propios : undefined],
      color_estado: [KEYS.lastColor, own('color_estado') ? data.color_estado : undefined],
      color_paletas: [KEYS.savedPalettes, own('color_paletas') ? data.color_paletas : undefined],
      herramientas_favoritas: [KEYS.toolFavorites, own('herramientas_favoritas') ? data.herramientas_favoritas : undefined],
      herramientas_filtro: [KEYS.toolFilter, own('herramientas_filtro') ? data.herramientas_filtro : undefined],
    };

    if (projects !== undefined && !Array.isArray(projects)) {
      throw new TypeError('La lista de proyectos no es valida.');
    }
    if (sales !== undefined && !Array.isArray(sales)) {
      throw new TypeError('El historial de ventas no es valido.');
    }
    if (draft !== undefined && draft !== null && (typeof draft !== 'object' || Array.isArray(draft))) {
      throw new TypeError('El borrador de la calculadora no es valido.');
    }

    return { projects, draft, sales, extras };
  }

  function restoreValue(label, key, value, restored) {
    if (value === undefined) return;
    const success = value === null ? remove(key) : writeJson(key, value);
    if (success) restored.push(label);
  }

  function restoreBackup(data) {
    const parsed = parseBackup(data);
    const restored = [];

    if (parsed.projects !== undefined && saveProjects(parsed.projects)) restored.push('proyectos');
    restoreValue('calculo actual', KEYS.calculatorDraft, parsed.draft, restored);
    if (parsed.sales !== undefined && saveSales(parsed.sales)) restored.push('ventas');
    for (const [label, [key, value]] of Object.entries(parsed.extras)) {
      restoreValue(label.replaceAll('_', ' '), key, value, restored);
    }

    return restored;
  }

  global.AppStorage = Object.freeze({
    KEYS,
    readJson,
    writeJson,
    remove,
    getProjects,
    saveProjects,
    getSales,
    saveSales,
    getCalculatorDraft,
    saveCalculatorDraft,
    createBackup,
    parseBackup,
    restoreBackup,
  });
})(window);
