const CACHE_NAME = "iso-v3";

// Install Event - skip waiting immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate Event - purge all old caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network first with no-cache for index.html
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Do not cache API or external auth calls
  const url = event.request.url;
  if (url.includes("firestore.googleapis.com") || url.includes("identitytoolkit")) {
    return;
  }

  // Network-First strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
