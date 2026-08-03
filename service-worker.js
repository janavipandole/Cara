const CACHE_NAME = 'cara-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/pages/shop.html',
  '/pages/cart.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/pages/blog.html',
  '/pages/checkout.html',
  '/pages/login.html',
  '/pages/register.html',
  '/pages/singleProduct.html',
  '/pages/privacy.html',
  '/pages/terms.html',
  '/pages/license.html',
  '/css/style.css',
  '/js/app.js',
  '/offline.html',
  '/images/Dlogo.png',
];

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
