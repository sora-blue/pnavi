const cacheName = 'cache-v2';
const cacheFiles = [
    '/',
    '/index.html',
    '/assets/index-8d108717.css',
    '/assets/main-13e1f2f6.js',
    '/favicon.ico',
    '/ServiceWorker.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheName)
            .then((cache) => {
                console.log("installed")
                return cache.addAll(cacheFiles)
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(async (keys) => {
            const cacheKeepList = [cacheName];
            const pruneCache = keys.filter((key) => !cacheKeepList.includes(key));
            await Promise.all(pruneCache.map((key) => caches.delete(key)));
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
            .catch(() => caches.match("offline.html"))
    );
});