/**
 * ====================================================================
 * SERVICE WORKER (Cache-First Offline Strategy)
 * ====================================================================
 * Precaches core HTML, CSS, JS, photos, music, and icons.
 * Cleans up older caches on activation.
 */

const CACHE_NAME = "bday-surprise-v1.0.7";

const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/config.js",
  "./js/fireworks.js",
  "./js/cake.js",
  "./js/app.js",
  "./manifest.json",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/photos/1.jpg",
  "./assets/photos/2.jpg",
  "./assets/photos/3.jpg",
  "./assets/photos/4.jpg",
  "./assets/music.mp3"
];

// Install Event: Pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Cache assets gracefully (allow partial failure if an optional photo is missing)
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            fetch(url).then((response) => {
              if (!response.ok) throw new Error(`Failed to fetch ${url}`);
              return cache.put(url, response);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Remove outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-first with Network Fallback
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Ignore browser extensions or chrome-extension schemes
  if (!request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          // If response is valid, dynamically cache fonts or external assets
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (request.url.includes("fonts.googleapis.com") ||
             request.url.includes("fonts.gstatic.com") ||
             request.url.includes("assets/"))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          if (request.headers.get("accept") && request.headers.get("accept").includes("text/html")) {
            return caches.match("./index.html");
          }
        });
    })
  );
});
