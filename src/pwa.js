// PWA registration + update detection for AmplifyU

export function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  // Don't register in dev if Vite dev server is running
  // (sw.js won't exist in the dev file system the same way)
  // Allow in production and Vite preview
  if (import.meta.env.DEV) {
    console.log('[PWA] Skipping SW registration in dev mode');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for SW updates via network
      });

      console.log('[PWA] SW registered, scope:', registration.scope);

      // Check for updates every time the page gains focus
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update();
        }
      });

      // Handle SW update found → new SW waiting
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New SW is waiting — notify the app to show update banner
            window.dispatchEvent(new CustomEvent('sw-update-available', {
              detail: { registration }
            }));
            console.log('[PWA] Update available');
          }
        });
      });

      // If a SW is already waiting when the page loads (e.g. after backgrounding)
      if (registration.waiting) {
        window.dispatchEvent(new CustomEvent('sw-update-available', {
          detail: { registration }
        }));
      }

      // After SKIP_WAITING is triggered, reload all tabs
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

    } catch (err) {
      console.warn('[PWA] SW registration failed:', err);
    }
  });
}

// Call this to immediately activate the waiting SW
export function applyUpdate(registration) {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}
