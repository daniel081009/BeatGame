const staticAssets = [
  "/",
  "/js/beatlist.js",
  "/js/bpm.js",
  "/js/delay.js",
  "/js/game.js",
  "/js/main.js",
  "/js/met.js",
  "/img/0.png",
  "/img/16.png",
  "/img/2-4-4.png",
  "/img/3.png",
  "/img/4-4-2.png",
  "/img/4.png",
  "/img/8.png",
];
self.addEventListener("install", async (event) => {
  const cache = await caches.open("static-cache");
  cache.addAll(staticAssets);
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === location.url) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(newtorkFirst(req));
  }
});
async function cacheFirst(req) {
  const cachedResponse = caches.match(req);
  return cachedResponse || fetch(req);
}
async function newtorkFirst(req) {
  const cache = await caches.open("dynamic-cache");

  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch (error) {
    return await cache.match(req);
  }
}
