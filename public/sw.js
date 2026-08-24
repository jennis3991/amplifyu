// AmplifyU Service Worker v2
// Strategy: network-first HTML, cache-first hashed assets, auto-update on deploy

const STATIC_CACHE = 'au-static-v2';
const BUILD_INFO_URL = '/build-info.json';

// ── Install ──────────────────────────────────────────────────────────────────
// skipWaiting immediately — a new SW activates (and wipes stale caches, see
// below) in the background as soon as it's installed, without waiting for a
// banner tap. We deliberately do NOT call clients.claim() in activate, so
// this never takes over an already-open tab/webview mid-session (e.g. mid
// recording) — it only controls the NEXT navigation (foreground/relaunch),
// which is when the update actually becomes visible.
self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(() => self.skipWaiting()));
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

      // Intentionally no clients.claim() here — see install handler comment.
      // Already-open tabs keep running under their original controller until
      // they naturally reload/relaunch; only then do they pick up this
      // (already-active, already-cache-fresh) worker.
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
