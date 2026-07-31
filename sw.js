const CACHE_NAME = 'cara-pwa-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/shop.html',
    '/offline.html',
    '/style.css',
    '/app.js',
    '/images/logo.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => {
            return res || fetch(e.request).catch(() => caches.match('/offline.html'));
        })
    );
});
