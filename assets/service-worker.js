// /service-worker.js
const CACHE_NAME = 'alyssiun-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/', '/manifest.webmanifest',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/js/includes.js',
  '/partials/header.html',
  '/partials/footer.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  })());
  self.clients.claim();
});

// Stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const networkFetch = fetch(req).then((res) => {
        cache.put(req, res.clone());
        return res;
      });
      return cached || await networkFetch;
    } catch (e){
      const cache = await caches.open(CACHE_NAME);
      const offline = await cache.match(OFFLINE_URL);
      return offline || new Response('You are offline', {status: 503});
    }
  })());
});
