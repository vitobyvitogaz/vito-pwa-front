// src/lib/webpush.ts

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

export const isPushSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

const urlBase64ToUint8Array = (base64String: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer as ArrayBuffer
}

// ── Préférences par défaut — tout activé ─────────────────────────────────────
export const DEFAULT_PREFERENCES = {
  promotions: true,
  resellers:  true,
  delivery:   true,
  broadcast:  true,
}

// ── S'abonner avec préférences ────────────────────────────────────────────────
export const subscribeToPush = async (
  zones: string[] = [],
  preferences = DEFAULT_PREFERENCES,
): Promise<boolean> => {
  if (!isPushSupported()) return false

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const registration = await navigator.serviceWorker.ready

    const vapidResponse = await fetch(`${API_URL}/notifications/vapid-public-key`)
    const { publicKey } = await vapidResponse.json()

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    const subJson = subscription.toJSON()

    const response = await fetch(`${API_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint:    subJson.endpoint,
        p256dh:      subJson.keys?.p256dh,
        auth:        subJson.keys?.auth,
        zones,
        preferences,
      }),
    })

    if (!response.ok) throw new Error('Erreur enregistrement subscription')

    localStorage.setItem('push-subscription-active', 'true')
    localStorage.setItem('push-subscription-endpoint', subJson.endpoint || '')
    localStorage.setItem('push-preferences', JSON.stringify(preferences))

    return true
  } catch (err) {
    console.error('Erreur subscribe push:', err)
    return false
  }
}

// ── Mettre à jour les préférences sans re-subscribe ───────────────────────────
export const updatePushPreferences = async (
  preferences: Record<string, boolean>,
): Promise<boolean> => {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return false

    const response = await fetch(`${API_URL}/notifications/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        preferences,
      }),
    })

    if (!response.ok && response.status !== 204) throw new Error('Erreur update preferences')

    localStorage.setItem('push-preferences', JSON.stringify(preferences))
    return true
  } catch (err) {
    console.error('Erreur updatePushPreferences:', err)
    return false
  }
}

// ── Désabonner ────────────────────────────────────────────────────────────────
export const unsubscribeFromPush = async (): Promise<boolean> => {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      localStorage.removeItem('push-subscription-active')
      return true
    }

    await fetch(`${API_URL}/notifications/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })

    await subscription.unsubscribe()

    localStorage.removeItem('push-subscription-active')
    localStorage.removeItem('push-subscription-endpoint')
    localStorage.removeItem('push-preferences')

    return true
  } catch (err) {
    console.error('Erreur unsubscribe push:', err)
    return false
  }
}

// ── Vérifier si abonné ────────────────────────────────────────────────────────
export const isPushSubscribed = async (): Promise<boolean> => {
  if (!isPushSupported()) return false
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return !!subscription
  } catch {
    return false
  }
}

// ── Lire les préférences depuis localStorage ──────────────────────────────────
export const getStoredPreferences = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem('push-preferences')
    if (stored) return JSON.parse(stored)
  } catch {}
  return { ...DEFAULT_PREFERENCES }
}

// ── Mettre à jour les zones ───────────────────────────────────────────────────
export const updatePushZones = async (zones: string[]): Promise<void> => {
  if (!isPushSupported()) return
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return
    const subJson = subscription.toJSON()
    const prefs = getStoredPreferences()
    await fetch(`${API_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint:    subJson.endpoint,
        p256dh:      subJson.keys?.p256dh,
        auth:        subJson.keys?.auth,
        zones,
        preferences: prefs,
      }),
    })
  } catch (err) {
    console.error('Erreur update zones push:', err)
  }
}

// ── Gestion du badge non lu ───────────────────────────────────────────────────
export const getUnreadCount = (): number => {
  try {
    return parseInt(localStorage.getItem('push-unread-count') || '0', 10)
  } catch {
    return 0
  }
}

export const clearUnreadCount = (): void => {
  localStorage.setItem('push-unread-count', '0')
  // Notifier les composants qui écoutent
  window.dispatchEvent(new Event('push-unread-cleared'))
}