const CACHE_NAME = 'homeglass-shell-v26';
const SHELL_FILES = [
  './',
  './display.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// App-shell files: cache-first (so the frame launches instantly, even offline).
// Everything else (Google APIs, weather, photo blobs, fonts): always network,
// never cached, since that data must stay fresh and some of it is per-token.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShellFile = url.origin === self.location.origin;

  if (!isShellFile) return; // let the browser handle it normally

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
