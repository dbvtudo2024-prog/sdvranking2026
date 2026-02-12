
const CACHE_NAME = 'sentinelas-v2';
const ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json'
];

// Instalação: Limpa caches antigos para forçar atualização
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação: Remove caches de versões anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Estratégia: Network First (Rede primeiro, depois Cache)
// Isso garante que se houver internet, ele baixe a versão MAIS NOVA do código.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
