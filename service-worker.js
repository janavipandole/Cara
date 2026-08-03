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
