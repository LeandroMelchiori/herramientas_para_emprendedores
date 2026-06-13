/* ============================================================
   analytics.js — Analítica del sitio (compartida por todas las páginas)

   Usa Vercel Web Analytics: cuenta visitas y geografía SIN cookies ni
   datos personales (no requiere banner de consentimiento).

   - Los "pageviews" (cuántos entran, desde dónde, qué módulo se visita más)
     se registran solos al cargar el script.
   - Los eventos propios se mandan con window.trackEvent(nombre, datos).

   IMPORTANTE: requiere activar "Web Analytics" en el panel de Vercel.
   Los pageviews andan en el plan gratis; los eventos propios pueden
   necesitar plan Pro. Si se quiere otra herramienta (ej. GoatCounter),
   solo hay que cambiar este archivo.
   ============================================================ */

// Cola: permite llamar a va() aunque el script de Vercel todavía no haya cargado.
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

// Carga el script de Vercel Web Analytics (auto-registra cada visita).
(function () {
  var s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);
})();

// Helper global para registrar un evento propio de forma segura.
// Ej: trackEvent('Copiar prompt', { categoria: 'redes' });
window.trackEvent = function (name, data) {
  try {
    window.va('event', data ? { name: name, data: data } : { name: name });
  } catch (e) { /* si la analítica no está disponible, no rompemos la app */ }
};
