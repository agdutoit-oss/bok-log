// Bok Log service worker — caches the app so it opens with no signal.
var CACHE = 'boklog-v1';
var SHELL = [
  './',
  './index.html',
  './manifest.json',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    // Cache what we can; ignore any single failure.
    return Promise.all(SHELL.map(function(u){
      return c.add(u).catch(function(){});
    }));
  }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  // Network-first, fall back to cache (so updates land, offline still works).
  e.respondWith(
    fetch(e.request).then(function(r){
      try {
        var rc = r.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, rc); });
      } catch (_) {}
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(m){
        return m || caches.match('./index.html');
      });
    })
  );
});
