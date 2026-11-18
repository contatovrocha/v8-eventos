// Service worker: deixa o app instalável e abre a casca sem internet.
// O Supabase (outro domínio) e as fontes vão sempre direto para a rede.
const CACHE = 'cdr-net-v11';
const SHELL = ['./', 'index.html', 'app.css?v=11', 'app.js?v=11', 'vendor/supabase-2.65.0.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'img/hero.jpg', 'sounds/clube-do-roi.mp3', 'sounds/clube-do-roi.m4a'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  })));
});

// ---------- Notificações push (pop-up no celular, mesmo com o app fechado) ----------
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'Clube do RØI', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Clube do RØI', {
    body: d.body || '', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
    tag: d.tag || undefined, data: { link: d.link || '#/notificacoes' }, vibrate: [80, 40, 80],
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = new URL('./', self.registration.scope).href + (e.notification.data && e.notification.data.link || '#/notificacoes');
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.startsWith(self.registration.scope)) { c.navigate(target).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(target);
  }));
});
