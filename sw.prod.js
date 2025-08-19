// Service Worker for WebGlo PWA - Production Optimized
const CACHE_NAME = 'webglo-v1.0.3';
const urlsToCache = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/pricing.html',
  '/contact.html',
  '/blog.html',
  '/post.html',
  '/return-policy.html',
  '/debug.html',
  '/css/style.css',
  '/css/mobile-first.css',
  '/js/main.js',
  '/js/components.js',
  '/js/blog.js',
  '/assets/logo.png',
  '/assets/logo.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - best practice for production
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    // Network-first for HTML/navigation
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          });
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        })
    );
  }
});

// ...existing code for sync, push, notification, and IndexedDB helpers...
