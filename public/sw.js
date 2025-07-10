const CACHE_NAME = 'bau-structura-v1.0.0';
const STATIC_CACHE = 'bau-structura-static-v1';
const DYNAMIC_CACHE = 'bau-structura-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/projects/,
  /\/api\/customers/,
  /\/api\/auth\/user/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Skip waiting...');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      handleAPIRequest(request)
    );
    return;
  }

  // Handle static files
  event.respondWith(
    handleStaticRequest(request)
  );
});

// Handle API requests with cache-first strategy for read operations
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  // Cache GET requests for specific endpoints
  if (request.method === 'GET' && shouldCacheAPI(url.pathname)) {
    try {
      // Try cache first
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('[SW] Serving API from cache:', url.pathname);
        
        // Fetch fresh data in background (stale-while-revalidate)
        fetchAndUpdateCache(request);
        
        return cachedResponse;
      }

      // Fallback to network
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful responses
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
      
    } catch (error) {
      console.log('[SW] API request failed, trying cache:', error);
      
      // Return cached version if network fails
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline page for failed API requests
      return new Response(JSON.stringify({
        error: 'Offline - Daten nicht verfügbar',
        cached: false
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      });
    }
  }

  // For non-GET requests, always go to network
  return fetch(request);
}

// Handle static file requests
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Static request failed:', error);
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback
    if (request.destination === 'document') {
      return caches.match('/');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Check if API endpoint should be cached
function shouldCacheAPI(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

// Fetch fresh data and update cache in background
async function fetchAndUpdateCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.log('[SW] Background fetch failed:', error);
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle queued offline actions
      processOfflineQueue()
    );
  }
});

// Process queued actions when back online
async function processOfflineQueue() {
  // This would handle offline form submissions, photo uploads, etc.
  console.log('[SW] Processing offline queue...');
  
  // Implementation for offline queue processing
  // Could store offline actions in IndexedDB and replay them
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Neue Benachrichtigung',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    tag: 'bau-structura-notification',
    actions: [
      {
        action: 'open',
        title: 'Öffnen'
      },
      {
        action: 'close',
        title: 'Schließen'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Bau-Structura', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});