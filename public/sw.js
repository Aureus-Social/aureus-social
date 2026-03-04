// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AUREUS SOCIAL PRO â€” SERVICE WORKER v2.0 (Item #38)
// Cache strategies: stale-while-revalidate for barÃ¨mes,
// network-first for data, cache-first for assets
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// IMPORTANT: IncrÃ©menter ces versions pour forcer la mise Ã  jour client.
const CACHE_NAME = 'aureus-v21.0';
const STATIC_CACHE = 'aureus-static-v21.0';
const DATA_CACHE = 'aureus-data-v21.0';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/compliance',
  '/landing.html',
];

// Install â€” precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate â€” clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== STATIC_CACHE && k !== DATA_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch â€” strategy based on request type
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter Google Fonts
  if (event.request.url.includes("fonts.googleapis.com") || event.request.url.includes("fonts.gstatic.com")) return;

  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension, etc
  if (!url.protocol.startsWith('http')) return;

  // API calls â€” Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request, DATA_CACHE, 5000));
    return;
  }

  // Supabase â€” Network only (real-time data)
  if (url.hostname.includes('supabase')) return;

  // Static assets (JS, CSS, images) â€” Cache first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // HTML pages â€” Stale while revalidate
  event.respondWith(staleWhileRevalidate(event.request, CACHE_NAME));
});

// â•â•â• CACHE STRATEGIES â•â•â•

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      headers: { 'Content-Type': 'application/json' }, status: 503
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || await fetchPromise || caches.match('/offline.html');
}

// â•â•â• PUSH NOTIFICATIONS â•â•â•
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Aureus Social Pro', {
      body: data.body || 'Nouvelle notification',
      icon: '/icon-192.png',
      badge: '/favicon-32.png',
      tag: data.tag || 'aureus-notif',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
      actions: data.actions || [{ action: 'open', title: 'Ouvrir' }],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// â•â•â• BACKGROUND SYNC â•â•â•
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-declarations') {
    event.waitUntil(syncPendingDeclarations());
  }
});

async function syncPendingDeclarations() {
  try {
    const cache = await caches.open(DATA_CACHE);
    const pending = await cache.match('/api/pending-sync');
    if (!pending) return;
    const data = await pending.json();
    for (const item of data.items || []) {
      await fetch('/api/v1/declarations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    }
    await cache.delete('/api/pending-sync');
  } catch (e) {
    console.warn('[SW] Sync failed:', e);
  }
}

