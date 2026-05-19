// AmplifyU Service Worker v2
// Strategy: network-first HTML, cache-first hashed assets, auto-update on deploy

const STATIC_CACHE = 'au-static-v1';
const BUILD_INFO_URL = '/build-info.json';

// ── Install ──────────────────────────────────────────────────────────────────
// Do NOT skipWaiting here — we let the app show an update banner and
// call skipWaiting on user confirmation (or immediately on next navigate).
self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(() => {}));
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Check for new build version — clear all caches if deploy changed
      try {
        const res = await fetch(BUILD_INFO_URL, { cache: 'no-store' });
        if (res.ok) {
          const { buildId } = await res.json();
          const stored = await caches.match('__au_build_id__');
          const storedId = stored ? await stored.text() : null;

          if (storedId && storedId !== buildId) {
            // New deploy detected — wipe all caches
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
            console.log('[SW] New build detected, caches cleared:', buildId);
          }

          // Store current buildId as a synthetic cache entry
          const cache = await caches.open(STATIC_CACHE);
          await cache.put(
            '__au_build_id__',
            new Response(buildId, { headers: { 'Content-Type': 'text/plain' } })
          );
        }
      } catch (e) {
        // Network unavailable — keep existing caches, continue offline
      }

      // Delete any foreign caches (old SW versions)
      const allKeys = await caches.keys();
      await Promise.all(
        allKeys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))
      );

      await self.clients.claim();
    })()
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET, same-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Never intercept build-info (always fresh)
  if (url.pathname === '/build-info.json') return;

  // HTML navigation: network-first, fall back to cache
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request) || caches.match('/'))
    );
    return;
  }

  // Hashed assets (JS, CSS — Vite names them with content hash): cache-first
  if (url.pathname.match(/\/assets\/.+\.(js|css)(\?.*)?$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Images and fonts: cache-first with network fallback
  if (url.pathname.match(/\.(jpg|jpeg|png|svg|webp|gif|ico|woff2?|ttf)(\?.*)?$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ── Messages ──────────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
