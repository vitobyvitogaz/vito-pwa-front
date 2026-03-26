// public/sw.js

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// ── Handler push ──────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const type = data.data?.type || 'BROADCAST'

  const options = {
    body:               data.body || 'Nouvelle information disponible',
    icon:               data.icon || '/icons/icon-192x192.png',
    badge:              data.badge || '/icons/badge-72x72.png',
    tag:                data.tag || type,
    data:               data.data || { url: '/fr' },
    renotify:           true,
    requireInteraction: false,
    silent:             false,
    vibrate:            data.vibrate || [200, 100, 200],
    actions:            data.actions || [],
  }

  event.waitUntil(
    Promise.all([
      // Afficher la notification
      self.registration.showNotification(data.title || '📢 Vitogaz Madagascar', options),
      // Incrémenter le compteur non lu dans tous les clients ouverts
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({ type: 'PUSH_RECEIVED' })
        })
      }),
    ])
  )
})

// ── Handler clic notification ─────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action   = event.action
  const notifData = event.notification.data || {}

  if (action === 'close') return

  let url = notifData.url || '/fr'

  if (notifData.type === 'RESELLERS' || action === 'map') {
    url = '/fr/revendeurs'
  } else if (notifData.type === 'DELIVERY') {
    url = '/fr/commander'
  } else if (notifData.type === 'PROMOTIONS' || action === 'view') {
    url = notifData.url || '/fr/promotions'
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          client.postMessage({ type: 'PUSH_NAVIGATE', url })
          return
        }
      }
      return clients.openWindow(url)
    })
  )
})

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification fermée:', event.notification.tag)
})