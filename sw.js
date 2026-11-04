// Gastos del mes · service worker: permite abrir la app sin internet.
// Si cambiás index.html, subí también este archivo con VERSION nueva para que el celular tome los cambios.
const VERSION = "gastos-v3";
const APP = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Firebase (datos y login) siempre por la red
  if (url.hostname === "api.github.com") return;
  // la página: primero la red (para tomar cambios), si no hay internet, la copia guardada
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put("./index.html", cp)); return r; }).catch(() => caches.match("./index.html")));
    return;
  }
  // resto (íconos, fuentes, librerías): copia guardada primero
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok || r.type === "opaque") { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); }
    return r;
  })));
});
