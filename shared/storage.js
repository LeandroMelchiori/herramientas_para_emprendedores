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
    expenses: 'gastos_historial',
    monthlyClosures: 'cierres_mensuales',
    backupLast: 'backup_ultimo',
    backupSnoozedUntil: 'backup_pospuesto_hasta',
    promptFavorites: 'gp_favs',
    customPrompts: 'gp_mine',
    lastColor: 'cc_last',
    savedPalettes: 'cc_saved',
    toolFavorites: 'hd_favs',
    toolFilter: 'hd_filter',
    dataSchema: 'app_data_schema',
    safetyBackup: 'app_backup_previo_restauracion',
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
    if (!global.AppMigrations) return Array.isArray(projects) ? projects : [];
    return global.AppMigrations.normalizeProjects(projects).value;
  }

  function saveProjects(projects) {
    return writeJson(KEYS.projects, Array.isArray(projects) ? projects : []);
  }

  function getSales() {
    const sales = readJson(KEYS.sales, []);
    if (!global.AppMigrations) return Array.isArray(sales) ? sales : [];
    return global.AppMigrations.normalizeSales(sales).value;
  }

  function saveSales(sales) {
    return writeJson(KEYS.sales, Array.isArray(sales) ? sales : []);
  }

  function getExpenses() {
    const expenses = readJson(KEYS.expenses, []);
    if (!global.AppMigrations) return Array.isArray(expenses) ? expenses : [];
    return global.AppMigrations.normalizeExpenses(expenses).value;
  }

  function saveExpenses(expenses) { return writeJson(KEYS.expenses, Array.isArray(expenses) ? expenses : []); }

  function getMonthlyClosures() {
    const closures = readJson(KEYS.monthlyClosures, []);
    if (!global.AppMigrations) return Array.isArray(closures) ? closures : [];
    return global.AppMigrations.normalizeClosures(closures).value;
  }

  function saveMonthlyClosures(closures) { return writeJson(KEYS.monthlyClosures, Array.isArray(closures) ? closures : []); }

  function getCalculatorDraft() {
    const draft = readJson(KEYS.calculatorDraft, null);
    return draft && typeof draft === 'object' && !Array.isArray(draft) ? draft : null;
  }

  function saveCalculatorDraft(draft) {
    return writeJson(KEYS.calculatorDraft, draft);
  }

  function createBackup() {
    return {
      version: '5.0',
      schemaVersion: global.AppMigrations?.SCHEMA_VERSION || 2,
      exportedAt: new Date().toISOString(),
      calculadora_proyectos: getProjects(),
      calculadora_autosave: getCalculatorDraft(),
      ventas_historial: getSales(),
      gastos_historial: getExpenses(),
      cierres_mensuales: getMonthlyClosures(),
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
    const expenses = own('gastos_historial') ? data.gastos_historial : undefined;
    const closures = own('cierres_mensuales') ? data.cierres_mensuales : undefined;
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
    if (expenses !== undefined && !Array.isArray(expenses)) throw new TypeError('La lista de gastos no es valida.');
    if (closures !== undefined && !Array.isArray(closures)) throw new TypeError('La lista de cierres no es valida.');
    if (draft !== undefined && draft !== null && (typeof draft !== 'object' || Array.isArray(draft))) {
      throw new TypeError('El borrador de la calculadora no es valido.');
    }

    return { projects, draft, sales, expenses, closures, extras };
  }

  function restoreValue(label, key, value, restored) {
    if (value === undefined) return;
    const success = value === null ? remove(key) : writeJson(key, value);
    if (success) restored.push(label);
  }

  function restoreBackup(data, options = {}) {
    const parsed = parseBackup(data);
    const createSafety = options.createSafety !== false;
    if (createSafety && !writeJson(KEYS.safetyBackup, createBackup())) {
      throw new Error('No se pudo crear la copia preventiva. La restauracion fue cancelada.');
    }
    const restored = [];

    if (parsed.projects !== undefined && saveProjects(parsed.projects)) restored.push('proyectos');
    restoreValue('calculo actual', KEYS.calculatorDraft, parsed.draft, restored);
    if (parsed.sales !== undefined && saveSales(parsed.sales)) restored.push('ventas');
    if (parsed.expenses !== undefined && saveExpenses(parsed.expenses)) restored.push('gastos');
    if (parsed.closures !== undefined && saveMonthlyClosures(parsed.closures)) restored.push('cierres');
    for (const [label, [key, value]] of Object.entries(parsed.extras)) {
      restoreValue(label.replaceAll('_', ' '), key, value, restored);
    }

    if (createSafety) global.dispatchEvent(new CustomEvent('app:backup-restored'));
    return restored;
  }

  function hasSafetyBackup() {
    return Boolean(readJson(KEYS.safetyBackup, null));
  }

  function restoreSafetyBackup() {
    const previous = readJson(KEYS.safetyBackup, null);
    if (!previous) throw new Error('No hay una restauracion anterior disponible.');
    const restored = restoreBackup(previous, { createSafety: false });
    remove(KEYS.safetyBackup);
    return restored;
  }

  /* Solo persiste si todos los registros son reconocibles; ante dudas conserva el original. */
  function migrateStoredData() {
    if (!global.AppMigrations) return { migrated: false, warnings: [] };
    let rawProjects;
    let rawSales;
    let rawExpenses;
    let rawClosures;
    try {
      const projectsText = localStorage.getItem(KEYS.projects);
      const salesText = localStorage.getItem(KEYS.sales);
      const expensesText = localStorage.getItem(KEYS.expenses);
      const closuresText = localStorage.getItem(KEYS.monthlyClosures);
      rawProjects = projectsText === null ? [] : JSON.parse(projectsText);
      rawSales = salesText === null ? [] : JSON.parse(salesText);
      rawExpenses = expensesText === null ? [] : JSON.parse(expensesText);
      rawClosures = closuresText === null ? [] : JSON.parse(closuresText);
    } catch (error) {
      return { migrated: false, warnings: ['Hay datos con formato JSON invalido; se conservaron sin cambios.'] };
    }
    const projects = global.AppMigrations.normalizeProjects(rawProjects);
    const sales = global.AppMigrations.normalizeSales(rawSales);
    const expenses = global.AppMigrations.normalizeExpenses(rawExpenses);
    const closures = global.AppMigrations.normalizeClosures(rawClosures);
    const warnings = [];
    if (projects.rejected) warnings.push(`${projects.rejected} proyecto(s) no reconocido(s)`);
    if (sales.rejected) warnings.push(`${sales.rejected} venta(s) no reconocida(s)`);
    if (expenses.rejected) warnings.push(`${expenses.rejected} gasto(s) no reconocido(s)`);
    if (closures.rejected) warnings.push(`${closures.rejected} cierre(s) no reconocido(s)`);
    if (warnings.length) return { migrated: false, warnings };

    const target = global.AppMigrations.SCHEMA_VERSION;
    const current = Number(readJson(KEYS.dataSchema, 0)) || 0;
    if (current >= target) return { migrated: false, warnings };
    const projectsSaved = writeJson(KEYS.projects, projects.value);
    const salesSaved = writeJson(KEYS.sales, sales.value);
    const expensesSaved = writeJson(KEYS.expenses, expenses.value);
    const closuresSaved = writeJson(KEYS.monthlyClosures, closures.value);
    const migrated = projectsSaved && salesSaved && expensesSaved && closuresSaved;
    if (migrated) writeJson(KEYS.dataSchema, target);
    return { migrated, warnings };
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
    getExpenses,
    saveExpenses,
    getMonthlyClosures,
    saveMonthlyClosures,
    getCalculatorDraft,
    saveCalculatorDraft,
    createBackup,
    parseBackup,
    restoreBackup,
    hasSafetyBackup,
    restoreSafetyBackup,
    migrateStoredData,
  });

  // Ejecuta una sola vez por version y mantiene intacta la base si detecta inconsistencias.
  migrateStoredData();
})(window);
