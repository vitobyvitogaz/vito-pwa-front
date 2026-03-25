// public/sw.js — Service Worker Vito by Vitogaz
// Gère : cache next-pwa + notifications push Web Push natif

self.addEventListener('install', (event) => {
  self.skipWaiting()
  console.log('[SW] Installé')
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
  console.log('[SW] Activé')
})

// ── Handler push — reçoit les notifications du backend ───────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const type = data.data?.type || 'BROADCAST'

  // ── Icônes et couleurs selon le type ──────────────────────────────────────
  const typeConfig = {
    PROMO_NEW:      { icon: '/icons/icon-192x192.png', badge: '/icons/badge-72x72.png' },
    PROMO_EXPIRING: { icon: '/icons/icon-192x192.png', badge: '/icons/badge-72x72.png' },
    PROMO_GEO:      { icon: '/icons/icon-192x192.png', badge: '/icons/badge-72x72.png' },
    RESELLER_NEW:   { icon: '/icons/icon-192x192.png', badge: '/icons/badge-72x72.png' },
    BROADCAST:      { icon: '/icons/icon-192x192.png', badge: '/icons/badge-72x72.png' },
  }

  const config = typeConfig[type] || typeConfig['BROADCAST']

  const options = {
    body:               data.body || 'Nouvelle information disponible',
    icon:               data.icon || config.icon,
    badge:              data.badge || config.badge,
    tag:                data.tag || type,
    data:               data.data || { url: '/fr' },
    renotify:           true,
    requireInteraction: false,
    silent:             false,
    vibrate:            data.vibrate || [200, 100, 200],
    actions:            data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || '📢 Vitogaz Madagascar',
      options
    )
  )
})

// ── Handler clic sur la notification ─────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action = event.action
  const notifData = event.notification.data || {}

  // ── URL selon l'action cliquée ────────────────────────────────────────────
  let url = notifData.url || '/fr'

  if (action === 'close') return // Ignorer sans ouvrir

  // Redirection selon le type
  if (notifData.type === 'RESELLER_NEW' || action === 'map') {
    url = '/fr/revendeurs'
  } else if (notifData.type?.startsWith('PROMO') || action === 'view') {
    url = notifData.url || '/fr/promotions'
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus si une fenêtre est déjà ouverte
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus()
          // Envoyer le message pour la navigation interne (SPA)
          client.postMessage({ type: 'PUSH_NAVIGATE', url })
          return
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      return clients.openWindow(url)
    })
  )
})

// ── Handler fermeture de notification (analytics) ────────────────────────────
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification fermée:', event.notification.tag)
})