const CACHE_NAME = 'journal-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// Install Event: Cache all necessary files for offline use
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Files cached successfully');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Fetch Event: Serve from cache if offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            // Return cached version if found, else fetch from network
            return cachedResponse || fetch(event.request);
        })
    );
});

// Activate Event: Clear old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

