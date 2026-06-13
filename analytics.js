/* ============================================================
   analytics.js — Analítica del sitio (compartida por todas las páginas)

   Usa GoatCounter: cuenta visitas, geografía, dispositivo y fuente de
   tráfico SIN cookies ni datos personales (no requiere banner de consentimiento).
   Panel: https://economiasocial.goatcounter.com

   - Los "pageviews" (cuántos entran, desde dónde, qué módulo se visita)
     se registran solos al cargar el script.
   - Los eventos propios se mandan con window.trackEvent(nombre, datos).
   - Para cambiar de herramienta, se toca SOLO este archivo.
   ============================================================ */

var GC_ENDPOINT = 'https://economiasocial.goatcounter.com/count';

// Cola para eventos disparados antes de que el script de GoatCounter cargue.
window._gcQueue = window._gcQueue || [];

// Carga el script de GoatCounter (auto-registra la visita de la página actual).
// Nota: GoatCounter NO cuenta en localhost, así que las pruebas locales no ensucian los datos.
(function () {
  var s = document.createElement('script');
  s.async = true;
  s.src = '//gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', GC_ENDPOINT);
  s.addEventListener('load', flushQueue);   // al cargar, vaciamos los eventos pendientes
  document.head.appendChild(s);
})();

function flushQueue() {
  if (!window.goatcounter || !window.goatcounter.count) return;
  while (window._gcQueue.length) window.goatcounter.count(window._gcQueue.shift());
}

// Convierte un texto en un slug apto para usar como "path" de evento.
function gcSlug(t) {
  return String(t).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // saca acentos
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

// Helper global para registrar un evento propio.
// Ej: trackEvent('Copiar prompt', { titulo: '...', categoria: 'redes' })
// GoatCounter cuenta por "path": codificamos el evento (+ el primer dato) en el path,
// así en el panel ves, por ejemplo, "evento/copiar-prompt/<titulo>" y cuáles se usan más.
window.trackEvent = function (name, data) {
  var path = 'evento/' + gcSlug(name);
  if (data) {
    var firstVal = Object.values(data)[0];
    if (firstVal) path += '/' + gcSlug(firstVal);
  }
  var hit = { path: path, title: name, event: true };
  if (window.goatcounter && window.goatcounter.count) window.goatcounter.count(hit);
  else window._gcQueue.push(hit);
};
