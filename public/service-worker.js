const CACHE = 'tough-love-v2'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return

  const url = new URL(e.request.url)

  // Skip cross-origin requests (Supabase, Google Fonts, etc.)
  if (url.origin !== location.origin) return

  // Hashed assets (/assets/xxx-[hash].js|css) — cache first, they're immutable
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached
          return fetch(e.request).then(res => {
            cache.put(e.request, res.clone())
            return res
          })
        })
      )
    )
    return
  }

  // index.html and all navigation — always network first so new deploys are picked up immediately
  // Fall back to network without caching HTML
  e.respondWith(fetch(e.request).catch(() => caches.match('/assets/')))
})

self.addEventListener('push', e => {
  if (!e.data) return
  const { title, body, icon } = e.data.json()
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon ?? '/favicon.svg',
      badge: '/favicon.svg',
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(clients.openWindow('/'))
})
