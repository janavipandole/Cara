const CACHE_NAME = 'cara-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/shop.html',
  '/cart.html',
  '/about.html',
  '/contact.html',
  '/blog.html',
  '/checkout.html',
  '/login.html',
  '/register.html',
  '/singleProduct.html',
  '/privacy.html',
  '/terms.html',
  '/license.html',
  '/style.css',
  '/app.js',
  '/offline.html',
  '/images/Dlogo.png',
];

// --- IndexedDB logic for Background Sync ---
const DB_NAME = 'CaraSyncDB';
const DB_VERSION = 1;
const QUEUE_STORE = 'cart-sync-queue';
const SYNCED_STORE = 'cart-synced-items';

function openCartSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(SYNCED_STORE)) {
        db.createObjectStore(SYNCED_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addCartSyncItem(storeName, item) {
  const db = await openCartSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getAllCartSyncItems(storeName) {
  const db = await openCartSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteCartSyncItem(storeName, id) {
  const db = await openCartSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
// -------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
});

self.addEventListener('fetch', (event) => {
  // Handle POST requests from Web Share Target API
  if (event.request.method === 'POST' && event.request.url.endsWith('/visual-search.html')) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const image = formData.get('image');
          
          if (image) {
            const cache = await caches.open('shared-image-cache');
            await cache.put('/shared-image', new Response(image, {
              headers: {
                'Content-Type': image.type,
                'Content-Length': image.size.toString()
              }
            }));
          }
          return Response.redirect('/visual-search.html', 303);
        } catch (error) {
          console.error('Error processing shared image:', error);
          return Response.redirect('/visual-search.html?error=1', 303);
        }
      })()
    );
    return;
  }

  // Handle cart background sync API intercept
  if (event.request.method === 'POST' && event.request.url.endsWith('/api/cart/sync')) {
    event.respondWith(
      fetch(event.request.clone()).catch(async (error) => {
        try {
          const item = await event.request.clone().json();
          await addCartSyncItem(QUEUE_STORE, item);
          if ('sync' in self.registration) {
            await self.registration.sync.register('sync-cart');
          }
          return new Response(JSON.stringify({ queued: true }), { 
            status: 202, 
            headers: { 'Content-Type': 'application/json' } 
          });
        } catch (idbError) {
          return new Response(JSON.stringify({ error: 'Failed to queue' }), { status: 500 });
        }
      })
    );
    return;
  }

  // Only handle http/https GET requests - skip chrome-extension://, etc.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => caches.match('/offline.html'))
      );
    }),
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(processCartSyncQueue());
  }
});

async function processCartSyncQueue() {
  const items = await getAllCartSyncItems(QUEUE_STORE);
  if (items.length === 0) return;
  
  for (const item of items) {
    const response = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    
    if (response.ok) {
      await addCartSyncItem(SYNCED_STORE, item);
      await deleteCartSyncItem(QUEUE_STORE, item.id);
    } else {
      throw new Error('Server returned non-ok status');
    }
  }
}
