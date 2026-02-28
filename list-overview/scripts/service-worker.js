const CACHE_NAME = "Stacked";
const ASSETS = [
  "./",
  "./index.html",
  "./styles/general.css",
  "./styles/section1.css",
  "./styles/section2.css",
  "./styles/darkmode.css",
  "./scripts/shortcuts.js",
  "./scripts/theme.js",
  "./scripts/add-row.js",
  "./images/plus.svg",
  "./images/minus.svg",
  "./videos/Trashcan.mp4",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});