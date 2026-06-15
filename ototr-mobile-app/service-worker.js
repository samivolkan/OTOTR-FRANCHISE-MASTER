const CACHE_NAME = "ototr-terminal-v107-local-api-pass-through";

// Keep install lightweight in Android WebView; large PNG screens are cached on first request.
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./src/app.js",
  "./src/config/supabaseRuntimeConfig.js",
  "./src/components/ui.js",
  "./src/screens/phase2-screens.js",
  "./src/services/evidenceUploadService.js",
  "./src/services/liveWorkOrdersService.js",
  "./src/data/mock-data.js",
  "./src/data/mockWorkOrders.js",
  "./src/data/business-rules.js",
  "./src/styles/tokens.css",
  "./src/styles/base.css",
  "./src/styles/components.css?v=splash-single-bar-v2",
  "./src/assets/home-reference/ototr-logo.png",
  "./src/assets/home-reference/technician-avatar.png",
  "./icons/favicon.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
