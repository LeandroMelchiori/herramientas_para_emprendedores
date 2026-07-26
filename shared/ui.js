/* ============================================================
   shared/ui.js - Utilidades pequenas de interfaz compartida.
   Evita repetir portapapeles, mensajes y slugs en cada modulo.
   ============================================================ */

(function initUI(global) {
  'use strict';

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = String(text);
    area.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } finally { area.remove(); }
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(String(text));
        return true;
      } catch (_) {
        // Algunos navegadores bloquean Clipboard API fuera de HTTPS.
      }
    }
    fallbackCopy(text);
    return true;
  }

  const toastTimers = new WeakMap();
  function showToast(target, message, duration = 2500) {
    const element = typeof target === 'string' ? document.getElementById(target) : target;
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimers.get(element));
    toastTimers.set(element, setTimeout(() => element.classList.remove('show'), duration));
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  global.AppUI = Object.freeze({ copyText, showToast, slugify });
})(window);
