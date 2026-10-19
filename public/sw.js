const CACHE_PREFIX = "native-static-";
const CACHE_NAME = CACHE_PREFIX + "v2";
const STATIC_ASSETS = ["/manifest.json","/shop-manifest.json","/vendor-manifest.json","/logo-horizontal.svg","/favicon.ico","/offline.html","/brand/native_logo_192.png"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match("/offline.html")) || new Response("You are offline. Reconnect and try again.", {
        status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    ));
    return;
  }
  if (!STATIC_ASSETS.includes(url.pathname) || url.search) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok) {
      const clone = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, clone)));
    }
    return response;
  }).catch(async () => (await caches.match(request)) || Response.error()));
});
function notificationUrl(value) {
  try {
    const url = new URL(value || "/", self.location.origin);
    return url.origin === self.location.origin ? url.href : self.location.origin + "/";
  } catch { return self.location.origin + "/"; }
}
self.addEventListener("push", (event) => {
  let data = { title: "Native", body: "You have an update." };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch {}
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: "/brand/native_logo_192.png", data: { url: notificationUrl(data.url) }
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = notificationUrl(event.notification.data?.url);
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async clients => {
    const existing = clients.find(client => client.url === url);
    if (existing) return existing.focus();
    return self.clients.openWindow(url);
  }));
});
