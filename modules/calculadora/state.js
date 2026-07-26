/* ============================================================
   state.js - Estado, autoguardado y serializacion de la calculadora.
   Mantiene la persistencia separada del renderizado visual.
   ============================================================ */

const MAX_FILAS      = 10;
const AUTOSAVE_SCHEMA = 2;  // incrementar si cambia la estructura del autosave

/* true después de guardar un proyecto en esta sesión; se usa para la advertencia de salida */
let proyectoGuardadoEnSesion = false;
let _pagProyectos = 1;
let _filtroProyectos = '';
let proyectoActivoId         = null;  // id del proyecto cargado (null = cálculo nuevo)
let proyectoActivoNombre     = '';    // nombre del proyecto activo para el modal

/* 5 filas vacías para que el emprendedor pueda empezar a llenar de inmediato */
const filaInsumoVacia  = () => ({ nombre: '', cantidad: 1, precio: 0 });
const filaServicioVacia = () => ({ nombre: '', horas: 1, precio: 0 });
const FILAS_INICIALES  = 5;

const estado = {
  insumos:       Array.from({ length: FILAS_INICIALES }, filaInsumoVacia),
  servicios:     Array.from({ length: FILAS_INICIALES }, filaServicioVacia),
  margen:        50,
  modo:          'slider', // 'slider' | 'precio'
  soloServicios: false,    // emprendedores que no usan materiales
  ivaActivo:     false,    // mostrar precio con IVA incluido
};

/* ── Inicio ── */

/* Sincroniza el DOM antes de persistir para no perder una edicion reciente. */
function sincronizarEstadoDesdeDOM() {
  document.querySelectorAll('#lista-insumos .row-insumo-wrap').forEach((wrap, i) => {
    if (!estado.insumos[i]) return;
    const [nombreI, cantI, precioI] = wrap.querySelectorAll('input');
    if (nombreI)  estado.insumos[i].nombre   = nombreI.value;
    if (cantI)    estado.insumos[i].cantidad  = parseFloat(cantI.value)  || 0;
    if (precioI)  estado.insumos[i].precio    = parseFloat(precioI.value) || 0;
  });
  document.querySelectorAll('#lista-servicios .row-insumo-wrap').forEach((wrap, i) => {
    if (!estado.servicios[i]) return;
    const [nombreI, horasI, precioI] = wrap.querySelectorAll('input');
    if (nombreI)  estado.servicios[i].nombre  = nombreI.value;
    if (horasI)   estado.servicios[i].horas   = parseFloat(horasI.value)  || 0;
    if (precioI)  estado.servicios[i].precio  = parseFloat(precioI.value) || 0;
  });
}

function leerEstadoCompleto() {
  sincronizarEstadoDesdeDOM();
  return {
    _schema:         AUTOSAVE_SCHEMA,
    nombreProducto:  document.getElementById('nombre-producto').value,
    unidades:        parseFloat(document.getElementById('unidades').value) || 1,
    insumos:         estado.insumos,
    servicios:       estado.servicios,
    margen:          estado.margen,
    modo:            estado.modo,
    soloServicios:   estado.soloServicios,
    ivaActivo:       estado.ivaActivo,
    precioManual:    parseFloat(document.getElementById('precio-manual').value) || 0,
    gastosMensuales: parseFloat(document.getElementById('gastos-mensuales').value) || 0,
    diasLaborales:   parseFloat(document.getElementById('dias-laborales').value) || 24,
    metaIngresos:    parseFloat(document.getElementById('meta-ingresos').value) || 0,
  };
}

function aplicarEstado(datos) {
  document.getElementById('nombre-producto').value  = datos.nombreProducto || '';
  document.getElementById('unidades').value         = datos.unidades || 1;
  document.getElementById('gastos-mensuales').value = datos.gastosMensuales || '';
  document.getElementById('dias-laborales').value   = datos.diasLaborales || 24;
  document.getElementById('precio-manual').value    = datos.precioManual || '';
  document.getElementById('margen-slider').value    = datos.margen || 50;
  { const mi = document.getElementById('margen-input'); if (mi) mi.value = datos.margen || 50; }
  document.getElementById('meta-ingresos').value    = datos.metaIngresos || '';
  const ivaEl = document.getElementById('iva-toggle');
  if (ivaEl) ivaEl.checked = datos.ivaActivo || false;
  /* Siempre mostrar al menos FILAS_INICIALES filas; completa con vacías si hacen falta */
  const padRows = (arr, factory) => {
    const rows = arr ? [...arr] : [];
    while (rows.length < FILAS_INICIALES) rows.push(factory());
    return rows;
  };
  estado.soloServicios = datos.soloServicios || false;
  estado.insumos   = estado.soloServicios ? [] : padRows(datos.insumos, filaInsumoVacia);
  estado.servicios = padRows(datos.servicios, filaServicioVacia);
  estado.margen    = datos.margen  || 50;
  estado.modo      = datos.modo    || 'slider';
  estado.ivaActivo = datos.ivaActivo || false;
  /* Sincronizar el toggle visual con el estado cargado */
  sincronizarUIToggle();
}

let autosaveTimer;
function autosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    if (AppStorage.saveCalculatorDraft(leerEstadoCompleto())) mostrarIndicadorAutosave();
  }, 500);
}

function mostrarIndicadorAutosave() {
  const el = document.getElementById('autosave-indicator');
  el.textContent = '✓ Guardado';
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 1500);
}

function cargarAutosave() {
  const datos = AppStorage.getCalculatorDraft();
  if (!datos) return;
  if ((datos._schema || 0) < AUTOSAVE_SCHEMA) {
    AppStorage.remove(AppStorage.KEYS.calculatorDraft);
    return;
  }
  aplicarEstado(datos);
}

/* ══ COMPARTIR POR URL ══ */

/* Serializa el calculo en la URL para compartirlo sin backend. */
function compartirPorLink() {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(leerEstadoCompleto()))));
  document.getElementById('share-url-text').textContent =
    `${location.origin}${location.pathname}?d=${encoded}`;
  abrirModal('modal-compartir');
}

async function copiarLink() {
  await AppUI.copyText(document.getElementById('share-url-text').textContent);
  mostrarToast('Link copiado');
}

function cargarDesdeURL() {
  const d = new URLSearchParams(location.search).get('d');
  if (!d) return false;
  try {
    aplicarEstado(JSON.parse(decodeURIComponent(escape(atob(d)))));
    history.replaceState(null, '', location.pathname);
    return true;
  } catch (_) { return false; }
}
