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
      // Incrémenter le compteur non lu dans les clients ouverts
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

  const action    = event.action
  const notifData = event.notification.data || {}
  const notifType = notifData.type

  // ── Feedback satisfaction ─────────────────────────────────────────────────
  if (notifType === 'FEEDBACK') {
    const attemptId = notifData.attemptId

    if (action === 'satisfied' || action === 'unsatisfied') {
      const satisfied = action === 'satisfied'

      // Envoyer la réponse au backend en arrière-plan
      event.waitUntil(
        fetch(`${API_URL}/feedback/respond`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ attempt_id: attemptId, satisfied }),
        }).catch(() => {}) // Silencieux si offline
      )
      // Ne pas naviguer — l'utilisateur a juste répondu à la notification
      return
    }

    // Clic sur la notification elle-même → ouvrir la page commander
    const url = notifData.url || '/fr/commander'
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