/* ============================================================
   backup.js - Exportacion completa + recordatorio semanal.
   Usa AppStorage para mantener un unico formato de datos.
   ============================================================ */

(function initBackup(global) {
  'use strict';

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const SNOOZE_MS = 2 * 24 * 60 * 60 * 1000;

  function downloadJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function hideBanner() {
    const banner = document.getElementById('backup-reminder');
    if (banner) banner.hidden = true;
  }

  function exportFullBackup() {
    const now = new Date();
    downloadJson(AppStorage.createBackup(), `backup-herramientas-${now.toISOString().slice(0, 10)}.json`);
    AppStorage.writeJson(AppStorage.KEYS.backupLast, Date.now());
    AppStorage.remove(AppStorage.KEYS.backupSnoozedUntil);
    hideBanner();
    if (typeof global.mostrarToast === 'function') global.mostrarToast('Backup descargado');
    if (typeof global.trackEvent === 'function') global.trackEvent('backup_exportar');
  }

  function snoozeBackup() {
    AppStorage.writeJson(AppStorage.KEYS.backupSnoozedUntil, Date.now() + SNOOZE_MS);
    hideBanner();
  }

  function createButton(label, action, primary = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', action);
    button.style.cssText = primary
      ? 'background:#F2A33B;color:#fff;border:0;border-radius:6px;padding:6px 14px;font:700 .82rem inherit;cursor:pointer'
      : 'background:none;color:#92400E;border:0;padding:6px;font:500 .78rem inherit;cursor:pointer;opacity:.72';
    return button;
  }

  function initReminder() {
    if (document.getElementById('backup-reminder')) return;

    const banner = document.createElement('aside');
    banner.id = 'backup-reminder';
    banner.hidden = true;
    banner.setAttribute('aria-label', 'Recordatorio de backup');
    banner.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;background:#FEF3E2;border-bottom:2px solid #F2A33B;padding:10px 16px;font-size:.82rem;color:#92400E;text-align:center';

    const message = document.createElement('span');
    message.textContent = 'Pas\u00f3 m\u00e1s de una semana desde tu \u00faltimo backup.';
    banner.append(message, createButton('Hacer backup ahora', exportFullBackup, true), createButton('M\u00e1s tarde', snoozeBackup));
    document.body.prepend(banner);

    const last = Number(AppStorage.readJson(AppStorage.KEYS.backupLast, 0));
    const snoozedUntil = Number(AppStorage.readJson(AppStorage.KEYS.backupSnoozedUntil, 0));
    if (Date.now() >= snoozedUntil && Date.now() - last >= WEEK_MS) banner.hidden = false;
  }

  function showRestoreUndo() {
    if (!AppStorage.hasSafetyBackup()) return;
    let notice = document.getElementById('restore-undo-notice');
    if (!notice) {
      notice = document.createElement('aside');
      notice.id = 'restore-undo-notice';
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:100;display:flex;align-items:center;gap:14px;max-width:calc(100% - 24px);background:#1a1a2e;color:#fff;padding:12px 16px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.24);font-size:.82rem';
      const message = document.createElement('span');
      message.textContent = 'Restauraci\u00f3n realizada. Pod\u00e9s volver al estado anterior.';
      const undo = createButton('Deshacer restauraci\u00f3n', () => {
        try {
          AppStorage.restoreSafetyBackup();
          location.reload();
        } catch (error) {
          console.warn('[Backup] No se pudo deshacer la restauracion.', error);
        }
      }, true);
      const close = createButton('Cerrar', () => { notice.hidden = true; });
      notice.append(message, undo, close);
      document.body.appendChild(notice);
    }
    notice.hidden = false;
  }

  global.addEventListener('app:backup-restored', showRestoreUndo);
  document.addEventListener('DOMContentLoaded', showRestoreUndo);

  global.exportarBackupCompleto = exportFullBackup;
  global.posponerBackup = snoozeBackup;
  document.addEventListener('DOMContentLoaded', initReminder);
})(window);
