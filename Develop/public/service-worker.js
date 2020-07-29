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