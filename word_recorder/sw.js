const CACHE ='JS'
const fontURL = 'https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i,800,800i&display=swap';
const FILES = ['/AtikJS/word_recorder/','/AtikJS/hal.js','/AtikJS/word_recorder/index.js','/AtikJS/word_recorder/style.css',fontURL]
function installCB(e) {
  e.waitUntil(
    caches.open(CACHE)
    .then(cache => cache.addAll(FILES))
    .catch(console.log)
  )
}

function cacheCB(e) { //cache first
    let req = e.request
    
    e.respondWith(
      caches.match(req)
      .then(r1 => r1 || fetch(req))
      .catch(console.log)
    )
}

self.addEventListener('fetch', cacheCB)
self.addEventListener('install', installCB)