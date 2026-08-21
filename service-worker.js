const CACHE_NAME = 'cara-cache-v3';
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

const STATIC_EXTENSIONS = [
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
];

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isNavigationRequest(request) {
  if (request.mode === 'navigate') return true;
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

function shouldBypassCache(request, url) {
  // Never cache API JSON / credentialed backends or HTML navigations.
  return isApiRequest(url) || isNavigationRequest(request);
}

function networkFirst(request) {
  return fetch(request)
    .then((networkResponse) => networkResponse)
    .catch(() =>
      caches.match(request).then((cached) => cached || caches.match('/offline.html')),
    );
}

function cacheFirstStatic(request) {
  return caches.match(request).then((cachedResponse) => {
    // Stale-while-revalidate: serve the cached copy immediately and refresh
    // it from the network in the background so updated assets reach users
    // without requiring a manual CACHE_NAME bump.
    const networkPromise = fetch(request).then((networkResponse) => {
      if (
        networkResponse &&
        networkResponse.ok &&
        networkResponse.type === 'basic'
      ) {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return networkResponse;
    });

    if (cachedResponse) {
      networkPromise.catch(() => {});
      return cachedResponse;
    }
    return networkPromise;
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
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
            await cache.put(
              '/shared-image',
              new Response(image, {
                headers: {
                  'Content-Type': image.type,
                  'Content-Length': image.size.toString(),
                },
              }),
            );
          }
          return Response.redirect('/visual-search.html', 303);
        } catch (error) {
          console.error('Error processing shared image:', error);
          return Response.redirect('/visual-search.html?error=1', 303);
        }
      })(),
    );
    return;
  }

  // Only handle http/https GET requests - skip chrome-extension://, etc.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  // Cross-origin: do not intercept (avoid caching opaque/third-party responses).
  if (url.origin !== self.location.origin) {
    return;
  }

  if (shouldBypassCache(event.request, url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStatic(event.request));
    return;
  }

  // Default: network-first for anything else on-origin.
  event.respondWith(networkFirst(event.request));
});

// BackgroundSync handler for auto-flushing offline order queue upon network recovery
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-orders') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'FLUSH_OFFLINE_ORDERS' });
        });
      })
    );
  }
});

// Exported for unit tests (ignored in the service worker runtime).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isApiRequest,
    isNavigationRequest,
    isStaticAsset,
    shouldBypassCache,
    CACHE_NAME,
  };
}

