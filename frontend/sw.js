const CACHE_VERSION = "pos-v1";
const SHELL = [
  "/",
  "/index.html",
  "/src/main.jsx",
];
const API_CACHE = "pos-api-v1";
const CATALOG_ENDPOINTS = ["/api/products/", "/api/categories/", "/api/branches/"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION && k !== API_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Non-GET: pass through (mutations handled by app's sync queue)
  if (req.method !== "GET") {
    event.respondWith(fetch(req).catch(() => new Response(JSON.stringify({ offline: true }), {
      headers: { "Content-Type": "application/json" }, status: 503 })));
    return;
  }

  // API GET → network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        if (CATALOG_ENDPOINTS.some((ep) => url.pathname.includes(ep.replace("/api/", "/")))) {
          caches.open(API_CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req).then((cached) => cached || new Response("[]", { headers: { "Content-Type": "application/json" } })))
    );
    return;
  }

  // Static assets → cache-first
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => {
    const clone = res.clone();
    caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
    return res;
  })));
});