const CACHE_NAME = 'my-cache-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/sounds/fire.mp3',
    '/sounds/Satara - The Game.mp3'
    // Add other assets or paths you want to cache
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});
