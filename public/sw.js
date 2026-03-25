/// <reference lib="webworker" />

const CACHE_NAME = 'cadence-station-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Ambient sound files to cache for offline use
const AMBIENT_SOUNDS = [
  '/sounds/brown-noise.mp3',
  '/sounds/white-noise.mp3',
  '/sounds/cafe.mp3',
  '/sounds/rain.mp3',
  '/sounds/forest.mp3',
  '/sounds/ocean.mp3',
];

const ALL_CACHE_URLS = [...STATIC_ASSETS, ...AMBIENT_SOUNDS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ALL_CACHE_URLS).catch(() => {
        // Don't fail install if sounds aren't available yet
        return cache.addAll(STATIC_ASSETS);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache-first for sounds and static assets
  if (
    url.pathname.startsWith('/sounds/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 408 }));
      })
    );
    return;
  }

  // Network-first for HTML, fallback to cached index
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Network-first for API calls
  if (url.pathname.startsWith('/api/') || url.hostname.includes('firebase')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => null);
      return cached || networkFetch || new Response('', { status: 408 });
    })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Cadence Station';
  const body = data.body || 'Time for a focus session!';
  const icon = '/icon-192.png';
  const badge = '/icon-192.png';
  const tag = data.tag || 'cadence-notification';
  const dataUrl = data.url || '/app/session/new';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url: dataUrl },
      actions: [
        { action: 'start', title: 'Start Session' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/app') && 'focus' in client) {
          client.navigate(event.notification.data.url);
          return client.focus();
        }
      }
      return self.clients.openWindow(event.notification.data.url);
    })
  );
});

// Periodic background sync for session tracking
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessionData());
  }
});

async function syncSessionData() {
  // Sync any locally stored session data that hasn't been uploaded
  const pending = await getPendingSessions();
  for (const session of pending) {
    try {
      await uploadSession(session);
      await markSessionSynced(session.id);
    } catch (e) {
      console.warn('Session sync failed:', e);
    }
  }
}

async function getPendingSessions() {
  // Implemented via IndexedDB in the app
  return [];
}

async function uploadSession(session) {
  // Placeholder — actual implementation would POST to Firebase or custom backend
}

async function markSessionSynced(id) {
  // Implemented via IndexedDB in the app
}
