const CACHE_NAME = 'cara-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './shop.html',
  './blog.html',
  './about.html',
  './contact.html',
  './style.css',
  './app.js',
  './images/logo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.log('Caching failed: ', err));
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});

// Handles caching static HTML, CSS, and image assets for offline recovery support.