/* ============================================================
   shared/format.js - Formatos consistentes para toda la suite.
   ============================================================ */

(function initFormat(global) {
  'use strict';

  const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function currencyARS(value) {
    const number = Number(value);
    return Number.isFinite(number) ? currencyFormatter.format(number) : '$0';
  }

  function dateTimeAR(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })} ${date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  function monthLabel(value) {
    const [year, month] = String(value).split('-').map(Number);
    if (!year || !month) return '';
    const label = new Date(year, month - 1, 1).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  global.AppFormat = Object.freeze({
    currencyARS,
    dateTimeAR,
    monthLabel,
    escapeHTML,
  });
})(window);
