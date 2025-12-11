// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting()
  console.log('Service Worker installé')
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
  console.log('Service Worker activé')
})

self.addEventListener('push', (event) => {
  console.log('Push event reçu:', event)
  
  const data = event.data ? event.data.json() : {}
  
  // Options supportées par Service Worker
  const options = {
    body: data.body || 'Nouvelle promotion disponible',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    tag: data.tag || 'promo-notification',
    data: data.data || { url: '/promotions' },
    // Propriétés spécifiques SW
    renotify: data.renotify || true,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  }
  
  // Ajouter vibration si supportée
  if (data.vibrate) {
    options.vibrate = data.vibrate
  }
  
  // Ajouter actions si fournies
  if (data.actions && Array.isArray(data.actions)) {
    options.actions = data.actions
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || '🎁 Promotion Vitogaz', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event)
  event.notification.close()
  
  const url = event.notification.data?.url || '/promotions'
  
  // Ouvrir l'application
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Vérifier si une fenêtre est déjà ouverte
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      return clients.openWindow(url)
    })
  )
})