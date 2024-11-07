/// <reference lib="WebWorker" />
/// <reference lib="ES2015" />

declare const self: ServiceWorkerGlobalScope;
export {};

self.addEventListener('install', (event) => {
  console.log('Install service worker');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', async (event) => {
  const request = event.request;
  const url = new URL(request.url);
  console.log('Hitting', url.pathname);
  if (url.pathname.includes('_build') || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          // Stash a copy of this page in the cache
          const copy = response.clone();
          caches.open('app-cache').then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          console.log('Failed online');
          return caches.match(request).then(function (response) {
            console.log('Got cache', response?.url);
            // return the cache response or the /offline page.
            return response;
          });
        }) as Promise<Response>
    );
  }
});
