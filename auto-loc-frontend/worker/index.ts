/// <reference lib="webworker" />

export {};

declare const self: ServiceWorkerGlobalScope;

// ─── 1. GESTION DES NOTIFICATIONS PUSH ───────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'AutoLoc';
    
    const options: any = {
      body: data.body || 'Une nouvelle mise à jour est disponible.',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/dashboard',
      },
      actions: [
        {
          action: 'open',
          title: 'Voir les détails',
        },
        {
          action: 'close',
          title: 'Fermer',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('Erreur Push:', error);
  }
});

// ─── 2. ACTIONS SUR LES NOTIFICATIONS ────────────────────────────────────
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return (client as WindowClient).focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// ─── 3. SYNCHRONISATION EN ARRIÈRE-PLAN ─────────────────────────────────
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-reservations') {
    event.waitUntil(handleSync());
  }
});

async function handleSync() {
  console.log('Syncing...');
}

