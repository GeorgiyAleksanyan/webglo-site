// Service Worker for WebGlo PWA
const CACHE_NAME = 'webglo-v1.0.2';
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
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Failed to cache resources:', error);
      })
  );
  // Force the new service worker to take control immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache when offline, but always try network first for HTML
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Network-first for navigation/HTML requests
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the fresh HTML for offline use
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, serve cached HTML fallback
          return caches.match(event.request).then(cached => {
            return cached || caches.match('/index.html');
          });
        })
    );
  } else {
    // Cache-first for static assets (CSS, JS, images, fonts)
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          // If not in cache, fetch from network and cache it
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
          // If offline and not cached, serve index.html for documents
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          return Promise.resolve();
        })
    );
  }
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  try {
    // Get stored form data from IndexedDB
    const formData = await getStoredFormData();
    if (formData) {
      // Submit the form data
      await submitFormData(formData);
      // Clear stored data after successful submission
      await clearStoredFormData();
    }
  } catch (error) {
    console.log('Failed to sync form data:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from WebGlo',
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    tag: 'webglo-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/assets/logo.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('WebGlo', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for IndexedDB operations
async function getStoredFormData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('webglo-db', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['forms'], 'readonly');
      const store = transaction.objectStore('forms');
      const getRequest = store.get('contact-form');

      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}

async function clearStoredFormData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('webglo-db', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');
      const deleteRequest = store.delete('contact-form');

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

async function submitFormData(formData) {
  // This would typically submit to your backend
  // For now, just log it
  console.log('Submitting form data:', formData);
  return Promise.resolve();
}
