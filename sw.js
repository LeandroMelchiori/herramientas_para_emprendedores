/* ============================================================
   sw.js — Service Worker (vive en la raíz, controla todo el sitio "/")
   Hace que la app funcione sin conexión y cargue más rápido.

   Estrategias de cacheo:
     - Navegaciones (HTML)     -> network-first  (siempre fresco; offline como respaldo)
     - Estáticos propios       -> stale-while-revalidate (instantáneo + se actualiza solo)
     - Recursos externos (CDN) -> stale-while-revalidate (en una cache aparte)
   ============================================================ */

// Subí este número en cada deploy para invalidar las caches viejas.
const VERSION   = 'v1.1.7';
const APP_CACHE = `app-${VERSION}`;       // Núcleo: HTML + iconos + assets propios
const RUNTIME   = `runtime-${VERSION}`;   // Externos: Google Fonts, CDNs, etc.

// Recursos que se descargan al instalar -> la app abre offline desde la 1ª visita.
const PRECACHE = [
  '/',
  '/index.html',
  '/modules/calculadora/',
  '/modules/guiadeprompts/',
  '/modules/combinadordecolores/',
  '/modules/herramientasdigitales/',
  '/manifest.json',
  '/favicon.ico',
  '/pwa.js',
  '/analytics.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/banner-santa-fe.png',
  '/assets/banco-solidario-santa-fe.png'
];

// ── INSTALL: precachear el núcleo (tolerante a fallos individuales) ──
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    // allSettled: si un recurso puntual falla (404, red), no rompe toda la instalación.
    await Promise.allSettled(PRECACHE.map((url) => cache.add(url)));
    await self.skipWaiting();   // Activa esta versión sin esperar a cerrar pestañas.
  })());
});

// ── ACTIVATE: eliminar caches de versiones anteriores ──
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k !== APP_CACHE && k !== RUNTIME).map((k) => caches.delete(k))
    );
    await self.clients.claim();   // Toma control de las páginas ya abiertas.
    /* Notifica a todas las pestañas abiertas para que recarguen con el código nuevo */
    const allClients = await self.clients.matchAll({ type: 'window' });
    allClients.forEach((client) => client.postMessage({ type: 'SW_UPDATED' }));
  })());
});

// ── FETCH: decidir la estrategia según el tipo de pedido ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;   // Solo cacheamos GET.

  const url = new URL(request.url);

  // 1) Navegación entre páginas (HTML) -> red primero.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 2) Recursos del propio dominio -> cache primero, refresco en segundo plano.
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, APP_CACHE));
    return;
  }

  // 3) Recursos externos (fuentes, CDNs) -> igual pero en cache separada.
  event.respondWith(staleWhileRevalidate(request, RUNTIME));
});

// Intenta la red; si no hay conexión, responde desde cache (o la home como respaldo).
async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());   // Guarda la última versión vista online.
    return fresh;
  } catch {
    return (await cache.match(request)) || (await cache.match('/')) || Response.error();
  }
}

// Responde al instante desde cache y, en paralelo, actualiza la copia para la próxima vez.
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      // Solo guardamos respuestas válidas (evita cachear errores).
      if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);

  return cached || (await network) || Response.error();
}
