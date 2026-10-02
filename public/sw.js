/* PABO AWARDS — service worker.
   - Ne met JAMAIS en cache les API, les paiements, la carte de vote ni l'administration :
     un vote n'existe que s'il est confirmé par le serveur.
   - Hors connexion : affiche les pages déjà visitées + une page d'information. */
const VERSION = "pabo-v2";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll(["/offline.html"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

const NEVER = [/^\/api\//, /^\/admin/, /^\/carte\//, /^\/voter\//];

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // sources externes (Supabase, CinetPay…) : jamais touchées
  if (NEVER.some((r) => r.test(url.pathname))) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/pay/")) {
    e.respondWith(
      caches.open(STATIC).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(PAGES).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/offline.html")))
    );
  }
});
