/* ============================================================
   pwa.js — Lógica PWA compartida por todas las páginas.
   1) Registra el Service Worker (modo offline + cacheo).
   2) Muestra un botón propio "Instalar app" cuando el navegador lo permite.
   ============================================================ */

// ── 1) Registro del Service Worker ──
if ('serviceWorker' in navigator) {
  // Esperamos a 'load' para no competir con la carga inicial de la página.
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('[PWA] No se pudo registrar el Service Worker:', err));
  });

  /* Cuando un nuevo SW toma el control (nueva versión deployada), recargamos la
     página automáticamente para que todos los usuarios reciban el código nuevo
     sin tener que saber qué es un Service Worker. */
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// ── 2) Botón de instalación personalizado ──
let deferredPrompt = null;   // Guardará el evento de instalación hasta que el usuario decida.

// Chrome/Edge/Android disparan este evento cuando la app cumple los requisitos para instalarse.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();        // Evitamos el mini-banner automático del navegador.
  deferredPrompt = e;        // Lo reservamos para lanzarlo desde nuestro botón.
  showInstallButton();
});

function showInstallButton() {
  if (document.getElementById('pwa-install-btn')) return;   // Evita duplicarlo.

  const btn = document.createElement('button');
  btn.id = 'pwa-install-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Instalar aplicación');
  btn.innerHTML = '<span aria-hidden="true">📲</span> Instalar app';
  // Estilos inline para que funcione en cualquier módulo sin depender de su CSS.
  btn.style.cssText = [
    'position:fixed', 'right:16px', 'bottom:16px', 'z-index:9990',
    'display:inline-flex', 'align-items:center', 'gap:8px',
    'padding:11px 16px', 'border:none', 'border-radius:30px',
    'background:linear-gradient(90deg,#F2A33B,#E85D3A,#D5306E,#6B3FA0)',
    'color:#fff', 'font:600 0.85rem/1 system-ui,sans-serif',
    'cursor:pointer', 'box-shadow:0 6px 20px rgba(213,48,110,0.4)'
  ].join(';');

  // Al hacer clic, lanzamos el diálogo nativo de instalación.
  btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;   // Esperamos la decisión del usuario.
    deferredPrompt = null;
    btn.remove();
  });

  document.body.appendChild(btn);
}

// Cuando la app ya quedó instalada, ocultamos el botón.
window.addEventListener('appinstalled', () => {
  document.getElementById('pwa-install-btn')?.remove();
  deferredPrompt = null;
  if (window.trackEvent) window.trackEvent('Instalar PWA');
});
