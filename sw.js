const CACHE_NAME = 'belajar-jepang-v1';
const ASSETS = [
  '/',
  '/index.html'
];

// Install — cache file utama
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — hapus cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first, fallback ke network
self.addEventListener('fetch', e => {
  // Jangan cache request ke Apps Script (API login)
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        // Cache response baru
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
