// public/sw.js

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

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
      self.registration.showNotification(data.title || '📢 Vitogaz Madagascar', options),
      // Notifier les clients avec les données complètes pour stockage localStorage
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            notification: {
              id:        Date.now(),
              title:     data.title || '📢 Vitogaz Madagascar',
              body:      data.body  || 'Nouvelle information disponible',
              notifType: data.data?.type || 'BROADCAST',
              url:       data.data?.url  || '/fr',
              receivedAt: new Date().toISOString(),
            },
          })
        })
      }),
    ])
  )
})

// ── Handler clic notification ─────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action    = event.action
  const notifData = event.notification.data || {}
  const notifType = notifData.type

  // ── Feedback satisfaction → page de notation étoiles ─────────────────────
  if (notifType === 'FEEDBACK') {
    const attemptId = notifData.attemptId
    // Tap sur la notification → ouvrir la page de notation étoiles
    const url = notifData.url || `/fr/rating/${attemptId}`
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
    return
  }

  // ── Notifications classiques ──────────────────────────────────────────────
  if (action === 'close') return

  let url = notifData.url || '/fr'
  if (notifType === 'RESELLERS' || action === 'map') {
    url = '/fr/revendeurs'
  } else if (notifType === 'DELIVERY') {
    url = '/fr/commander'
  } else if (notifType === 'PROMOTIONS' || action === 'view') {
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