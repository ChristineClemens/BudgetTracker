console.log("Service worker started!");

function delay(s) {
    return new Promise (resolve => setTimeout(resolve, s *1000));
};

async function serviceCode() {
    let count = 0;
    while (1) {
        console.log(`Service worker processing ${count}`);
        count++;
        await delay(1);
        console.log(self);
        navigator.serviceWorker.controller.postMessage({count});
    }
};

serviceCode();

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

var urlsToCache = [
    "/",
    "/db.js",
    "/index/js",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

//Caching capability initialization
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Cache opened successfully!");
            return cache.addAll(urlsToCache);
        })
    )
});

// Activate Caching
self.addEventListener("activate", function(event) {
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );

//Fetch request
self.addEventListener("fetch", function(event) {
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              // If the response indicates success, clone the response and store it in the cache.
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              // If the metwork request failed, attempt to retrieve it from the cache.
              return cache.match(event.request);
            });
        }).catch(err => console.log(err))
      );
      return;
    }

    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request);
        });
      })
    );
  });
});