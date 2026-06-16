/* ============================================================
   backup.js — Exportación completa de datos + recordatorio semanal.
   Incluido en los módulos que manejan datos persistentes.
   ============================================================ */

const _BACKUP_ULTIMO_KEY    = 'backup_ultimo';
const _BACKUP_POSPUESTO_KEY = 'backup_pospuesto_hasta';
const _SEMANA_MS            = 7 * 24 * 60 * 60 * 1000;

/* Descarga un único JSON con todos los datos de la app */
function exportarBackupCompleto() {
  const ahora = new Date();
  const datos = {
    version:              '1.0',
    exportado:            ahora.toISOString(),
    calculadora_proyectos: _leerLS('calculadora_proyectos') || [],
    calculadora_autosave:  _leerLS('calculadora_autosave')  || null,
    ventas_historial:      _leerLS('ventas_historial')      || [],
  };

  const nombre = `backup-herramientas-${ahora.toISOString().slice(0, 10)}.json`;
  const blob   = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const a      = document.createElement('a');
  a.href       = URL.createObjectURL(blob);
  a.download   = nombre;
  a.click();
  URL.revokeObjectURL(a.href);

  localStorage.setItem(_BACKUP_ULTIMO_KEY, Date.now().toString());
  _ocultarBanner();

  if (typeof mostrarToast === 'function') mostrarToast('Backup descargado ✓');
  if (typeof trackEvent   === 'function') trackEvent('backup_exportar');
}

/* Pospone el aviso 2 días sin hacer backup */
function posponerBackup() {
  const hasta = Date.now() + 2 * 24 * 60 * 60 * 1000;
  localStorage.setItem(_BACKUP_POSPUESTO_KEY, hasta.toString());
  _ocultarBanner();
}

/* ── Internos ── */

function _leerLS(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

function _ocultarBanner() {
  const b = document.getElementById('_backup-banner');
  if (b) b.style.display = 'none';
}

function _mostrarBanner() {
  const b = document.getElementById('_backup-banner');
  if (b) b.style.display = 'flex';
}

/* Inyecta el banner en el DOM y verifica si corresponde mostrarlo */
function _initBackupReminder() {
  /* Crear banner solo una vez */
  if (!document.getElementById('_backup-banner')) {
    const banner = document.createElement('div');
    banner.id = '_backup-banner';
    banner.style.cssText = [
      'display:none', 'align-items:center', 'justify-content:center',
      'gap:10px', 'flex-wrap:wrap',
      'background:#FEF3E2', 'border-bottom:2px solid #F2A33B',
      'padding:10px 16px', 'font-size:0.82rem', 'color:#92400E',
      'text-align:center'
    ].join(';');
    banner.innerHTML =
      '<span>⏰ Pasó más de una semana desde tu último backup.</span>' +
      '<button onclick="exportarBackupCompleto()" style="' +
        'background:#F2A33B;color:white;border:none;border-radius:6px;' +
        'padding:5px 14px;font-size:0.82rem;font-weight:700;cursor:pointer;' +
        'font-family:inherit">' +
        'Hacer backup ahora' +
      '</button>' +
      '<button onclick="posponerBackup()" style="' +
        'background:none;border:none;color:#92400E;font-size:0.78rem;' +
        'cursor:pointer;opacity:0.65;font-family:inherit">' +
        'Más tarde' +
      '</button>';
    /* Insertar antes de todo el contenido para que quede encima del header */
    document.body.insertBefore(banner, document.body.firstChild);
  }

  /* Verificar si hay que mostrar el recordatorio */
  const ultimo     = parseInt(localStorage.getItem(_BACKUP_ULTIMO_KEY)    || '0');
  const pospuesto  = parseInt(localStorage.getItem(_BACKUP_POSPUESTO_KEY) || '0');

  if (Date.now() < pospuesto)           return;  // el usuario lo pospuso
  if (Date.now() - ultimo < _SEMANA_MS) return;  // backup reciente

  _mostrarBanner();
}

document.addEventListener('DOMContentLoaded', _initBackupReminder);
