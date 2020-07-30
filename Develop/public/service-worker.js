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

const FILES_TO_CACHE = [];
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//Caching capability initialization
self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[serviceWorker: install] files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    )
    self.skipWaiting();
});

// Activate Caching
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
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
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response indicates success, clone the response and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              // If the metwork request failed, attempt to retrieve it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
      return;
    }

    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  });