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

const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

const filesToCache = [
    "/",
    "/assets/db.js",
    "/assets/index.js",
    "/public/manifest.json",
    "/assets/styles.css",
    "/assets/icons/icon-192x192.png",
    "/assets/icons/icon-512x512.png"
];

//Caching capability initialization
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Cache opened successfully! Files are now being stored in the array.");
            return cache.addAll(filesToCache);
        })
    )
});

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
        )
        return;
    }

    event.respondWith(
        fetch(event.request).catch(function() {
            return cache.match(event.request).then(function (response) {
                if (response) {
                    return response;
                } else if (event.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/");
                }
            })
        })
    )
});
