const CACHE = 'glowai-v1';
const ASSETS = ['index.html', 'onboarding.html', 'dashboard.html', 'manifest.json'];

// Install: cache core files
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Fetch: network-first, fall back to cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return r;
    }).catch(() => caches.match(e.request))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'GlowAI', body: "Time to check in on your goals! 🌟" };
  e.waitUntil(self.registration.showNotification(data.title || 'GlowAI', {
    body: data.body || "Keep up your streak!",
    icon: '/Glow-AI/icon-192.png',
    badge: '/Glow-AI/icon-192.png',
    tag: 'glowai-push',
    requireInteraction: false,
    data: { url: data.url || '/Glow-AI/dashboard.html' }
  }));
});

// Notification click → open dashboard
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/Glow-AI/dashboard.html';
  e.waitUntil(clients.matchAll({ type: 'window' }).then(ws => {
    const w = ws.find(c => c.url.includes('dashboard'));
    if (w) return w.focus();
    return clients.openWindow(url);
  }));
});

// Schedule local daily reminder
function scheduleDailyReminder() {
  const now = new Date();
  const next = new Date();
  next.setHours(20, 0, 0, 0); // 8pm daily reminder
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  setTimeout(() => {
    self.registration.showNotification('GlowAI Daily Check-In 🌟', {
      body: "Have you logged your habits and water today? Keep your streak alive!",
      tag: 'glowai-daily',
      requireInteraction: false
    });
    scheduleDailyReminder();
  }, delay);
}

self.addEventListener('activate', () => scheduleDailyReminder());
