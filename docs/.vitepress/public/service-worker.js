/* globals self -- Service worker */
// https://github.com/NekR/self-destroying-sw
self.addEventListener("install", (_e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (_e) => {
  self.registration
    .unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => {
      for (const client of clients) client.navigate(client.url);
    });
});
