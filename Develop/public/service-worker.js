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