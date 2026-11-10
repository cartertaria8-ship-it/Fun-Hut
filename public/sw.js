const CACHE_NAME = "fun-hut-offline-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const response = await fetch("/precache.json", { cache: "no-store" });
      const assets = await response.json();
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(["/", ...assets]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name.startsWith("fun-hut-offline-") && name !== CACHE_NAME).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request, { ignoreVary: true });
          return cached ?? caches.match("/", { ignoreVary: true });
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        return response;
      });
    }),
  );
});