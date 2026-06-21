const CACHE = 'exam-buddy-v1';
const ASSETS = ['./index.html', './manifest.json', './icon-192.svg', './icon-512.svg'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    }).then(function() {
      return clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('anthropic.com') ||
      e.request.url.includes('cdnjs.cloudflare.com') ||
      e.request.url.includes('fonts.googleapis.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        return caches.open(CACHE).then(function(cache) {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    }).catch(function() {
      return caches.match('./index.html');
    })
  );
});
