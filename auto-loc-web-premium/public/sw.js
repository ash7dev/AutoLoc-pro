/* ==========================================================================
   AUTOLOC PREMIUM PWA SERVICE WORKER
   Version: 1.0.0
   Cache Strategy: Network-First for Pages, Stale-While-Revalidate for Assets,
                   Offline Fallback Page & Native Push Notifications.
   ========================================================================== */

const CACHE_NAME = 'autoloc-pwa-v1.0.0';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// 1. INSTALLATION — Pré-mise en cache résiliente & activation immédiate
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[PWA SW] Pre-caching offline assets & fallback page');
        return Promise.allSettled(
          PRECACHE_ASSETS.map((asset) =>
            cache.add(asset).catch((err) => console.warn('[PWA SW] Failed to cache asset:', asset, err))
          )
        );
      })
  );
});

// 2. ACTIVATION — Prise de contrôle immédiate des clients & nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[PWA SW] Deleting obsolete cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. FETCH — Stratégie réseau-d'abord pour la navigation HTML, Stale-while-revalidate pour le reste
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignorer les requêtes non-GET et les extensions Chrome/analytics
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;
  if (request.url.includes('/api/')) return; // Laisser passer l'API en direct

  // Navigation HTML (Pages de l'application)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Mettre en cache la copie fraîche de la page
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Si le réseau échoue (Offline), servir depuis le cache ou la page offline
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;

          return new Response('Connexion internet requise', {
            status: 533,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Fichiers statiques (Images, Fonts, CSS, JS) -> Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. PUSH NOTIFICATIONS — Gestion des notifications Push multi-canaux
self.addEventListener('push', (event) => {
  let data = {
    title: 'AutoLoc Sénégal',
    body: 'Nouvelle mise à jour disponible sur AutoLoc !',
    url: '/',
    icon: '/icon-192.png',
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = { ...data, ...json };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 5. CLICK NOTIFICATION — Clic sur une notification push
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
