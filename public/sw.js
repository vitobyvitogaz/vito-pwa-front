// public/sw.js

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

// ── Versions et noms des caches (changer CACHE_VERSION pour vider les anciens) ──
const CACHE_VERSION = 'v1'
const CACHES = {
  shell:  `vito-shell-${CACHE_VERSION}`,   // page de secours (jamais purgée)
  pages:  `vito-pages-${CACHE_VERSION}`,   // pages déjà visitées
  static: `vito-static-${CACHE_VERSION}`,  // fichiers de l'application (/_next/static)
  api:    `vito-api-${CACHE_VERSION}`,     // données publiques
  pdf:    `vito-pdf-${CACHE_VERSION}`,     // PDF des documents
  images: `vito-images-${CACHE_VERSION}`,  // images optimisées
}
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  // Page de secours hors ligne, mise en cache à l'installation (échec silencieux)
  event.waitUntil(
    caches.open(CACHES.shell).then((cache) => cache.add(OFFLINE_URL)).catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Supprime les caches des anciennes versions (préfixe « vito- » uniquement)
      const keep = new Set(Object.values(CACHES))
      const names = await caches.keys()
      await Promise.all(
        names.filter((n) => n.startsWith('vito-') && !keep.has(n)).map((n) => caches.delete(n))
      )
      await clients.claim()
    })()
  )
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
    const relativeUrl = notifData.url || `/fr/rating/${attemptId}`
    const absoluteUrl = relativeUrl.startsWith('http')
      ? relativeUrl
      : `${self.location.origin}${relativeUrl}`

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('navigate' in client) {
            client.navigate(absoluteUrl)
            client.focus()
            return
          }
          if ('focus' in client) {
            client.focus()
            client.postMessage({ type: 'PUSH_NAVIGATE', url: relativeUrl })
            return
          }
        }
        return clients.openWindow(absoluteUrl)
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


// ═════════════════════════════════════════════════════════════════════════════
// MODE HORS LIGNE — mise en cache
// (ne modifie pas le code des notifications ci-dessus)
// ═════════════════════════════════════════════════════════════════════════════

const DAY = 24 * 60 * 60 * 1000
const STAMP = 'x-sw-cached-at'
const API_ORIGIN = new URL(API_URL).origin
const API_PATH_PREFIX = new URL(API_URL).pathname // /api/v1

// Données PUBLIQUES uniquement. Jamais : scan, points, échanges, notifications,
// avis, QR… (données liées à un numéro de téléphone ou à une personne).
const API_RULES = [
  { re: /^\/resellers(\/active)?$/,                maxAge: 7 * DAY },
  { re: /^\/promotions(\/[^/]+)?$/,                maxAge: 1 * DAY },
  { re: /^\/documents$/,                           maxAge: 7 * DAY },
  { re: /^\/delivery-companies$/,                  maxAge: 7 * DAY },
  { re: /^\/products(\/active)?$/,                 maxAge: 7 * DAY },
  { re: /^\/reward-items(\/[^/]+)?$/,              maxAge: 7 * DAY },
  { re: /^\/settings(\/(popup_settings|enterprise_offer_settings))?$/, maxAge: 7 * DAY },
]

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

// Enregistre une copie de la réponse avec la date de mise en cache
async function putWithStamp(cacheName, request, response) {
  const headers = new Headers(response.headers)
  headers.set(STAMP, String(Date.now()))
  const body = await response.blob()
  const stamped = new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
  const cache = await caches.open(cacheName)
  await cache.put(request, stamped)
}

function isFresh(response, maxAge) {
  if (!maxAge) return true
  const cachedAt = Number(response.headers.get(STAMP) || 0)
  return cachedAt > 0 && Date.now() - cachedAt < maxAge
}

// Garde les maxEntries entrées les plus récentes
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length <= maxEntries) return
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((k) => cache.delete(k)))
}

function store(event, cacheName, request, response, maxEntries) {
  event.waitUntil(
    putWithStamp(cacheName, request, response.clone())
      .then(() => (maxEntries ? trimCache(cacheName, maxEntries) : undefined))
      .catch(() => {})
  )
}

// Réseau d'abord ; en cas d'échec ou de lenteur, copie en cache si elle n'est pas périmée
async function networkFirst(event, cacheName, opts) {
  const request = event.request
  const cacheable = opts.cacheable || ((r) => r.status === 200)
  try {
    const response = await withTimeout(fetch(request), opts.timeout || 10000)
    if (cacheable(response)) store(event, cacheName, request, response, opts.maxEntries)
    return response
  } catch (err) {
    const cached = await caches.match(request, { cacheName })
    if (cached && isFresh(cached, opts.maxAge)) return cached
    throw err
  }
}

// Cache d'abord ; réseau si absent ou périmé (copie périmée servie si le réseau échoue)
async function cacheFirst(event, cacheName, opts) {
  const request = event.request
  const cacheable = opts.cacheable || ((r) => r.status === 200)
  const cached = await caches.match(request, { cacheName })
  if (cached && isFresh(cached, opts.maxAge)) return cached
  try {
    const response = await fetch(request)
    if (cacheable(response)) store(event, cacheName, request, response, opts.maxEntries)
    return response
  } catch (err) {
    if (cached) return cached
    throw err
  }
}

async function handleNavigation(event) {
  try {
    return await networkFirst(event, CACHES.pages, {
      timeout: 8000,
      maxEntries: 40,
      // Pages publiques uniquement ; une redirection ne peut pas être resservie telle quelle
      cacheable: (r) => r.status === 200 && !r.redirected && r.type === 'basic',
    })
  } catch (err) {
    const url = new URL(event.request.url)
    // « / » redirige vers « /fr » : on sert la page d'accueil déjà visitée
    if (url.pathname === '/') {
      const home = await caches.match('/fr', { cacheName: CACHES.pages })
      if (home) return home
    }
    const offline = await caches.match(OFFLINE_URL, { cacheName: CACHES.shell })
    return offline || Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // 1. Pages de l'application
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(handleNavigation(event))
    return
  }

  // 2. Fichiers de l'application et images optimisées (même origine)
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/_next/static/')) {
      event.respondWith(cacheFirst(event, CACHES.static, { maxEntries: 300 }))
    } else if (url.pathname === '/_next/image') {
      event.respondWith(cacheFirst(event, CACHES.images, { maxAge: 30 * DAY, maxEntries: 150 }))
    }
    return
  }

  // 3. Données publiques de l'API
  if (url.origin === API_ORIGIN && url.pathname.startsWith(API_PATH_PREFIX + '/')) {
    const path = url.pathname.slice(API_PATH_PREFIX.length)
    const rule = API_RULES.find((r) => r.re.test(path))
    if (rule) {
      event.respondWith(
        networkFirst(event, CACHES.api, { timeout: 10000, maxAge: rule.maxAge, maxEntries: 60 })
      )
    }
    return
  }

  // 4. PDF des documents (stockage Supabase) — réponses CORS uniquement (jamais « opaques »)
  if (
    url.hostname.endsWith('.supabase.co') &&
    url.pathname.startsWith('/storage/v1/object/public/documents/')
  ) {
    event.respondWith(
      cacheFirst(event, CACHES.pdf, {
        maxAge: 30 * DAY,
        maxEntries: 30,
        cacheable: (r) => r.status === 200 && r.type === 'cors',
      })
    )
  }
})
