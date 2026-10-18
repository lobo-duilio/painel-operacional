/* Service worker — alertas de segurança (SST) do Painel Operacional.
 * Recebe mensagens só-dados do Firebase Cloud Messaging e mostra a notificação. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (event) {
  var p = {};
  try { p = event.data ? event.data.json() : {}; } catch (e) { p = { data: { corpo: event.data ? event.data.text() : '' } }; }
  var d = p.data || {};
  if (p.notification) { d.titulo = d.titulo || p.notification.title; d.corpo = d.corpo || p.notification.body; }
  var titulo = d.titulo || 'Alerta de segurança — Spizaetus';
  var opcoes = {
    body: d.corpo || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'sst-' + (d.id || Date.now()),
    renotify: true,
    requireInteraction: d.nivel !== 'TESTE',
    vibrate: [300, 150, 300, 150, 600],
    data: { link: d.link || self.registration.scope, id: d.id || '' }
  };
  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var link = (event.notification.data && event.notification.data.link) || self.registration.scope;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].url.indexOf(self.registration.scope) === 0 && 'focus' in lista[i]) return lista[i].focus();
    }
    return self.clients.openWindow(link);
  }));
});
