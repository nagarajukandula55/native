// Minimal service worker -- exists mainly to satisfy PWA installability
// criteria (a registered SW + a valid manifest) and cache static assets for
// faster repeat loads. Deliberately network-first for everything so a
// stale cached page/API response is never served over a fresh one -- this
// is a food ecommerce site with live prices/stock, correctness matters
// more than offline browsing.
const CACHE_NAME = "native-static-v1";
const STATIC_ASSETS = ["/manifest.json", "/logo-horizontal.svg", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && STATIC_ASSETS.some((a) => request.url.endsWith(a))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Web Push -- displays a real OS/browser notification for whatever angroup
// sent via lib/push/sendPushNotification.ts (order picked up, rider on the
// way, etc.). Payload is plain JSON: { title, body, url? }.
self.addEventListener("push", (event) => {
  let data = { title: "Native", body: "You have an update." };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // ignore malformed payloads
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
