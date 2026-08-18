const CACHE_VERSION = "wasuta-archive-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [
	OFFLINE_URL,
	"/manifest.webmanifest",
	"/icons/icon-192.png",
	"/icons/icon-512.png",
	"/icons/icon-maskable-192.png",
	"/icons/icon-maskable-512.png",
	"/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_VERSION)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_VERSION)
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET") return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin || url.pathname.startsWith("/api/"))
		return;

	if (request.mode === "navigate") {
		event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
		return;
	}

	const cacheableDestinations = new Set(["font", "image", "script", "style"]);
	if (!cacheableDestinations.has(request.destination)) return;

	event.respondWith(
		fetch(request)
			.then((response) => {
				if (response.ok) {
					const copy = response.clone();
					void caches
						.open(CACHE_VERSION)
						.then((cache) => cache.put(request, copy));
				}
				return response;
			})
			.catch(() => caches.match(request)),
	);
});
