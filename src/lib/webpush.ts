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

// ── Convertir la clé VAPID base64 en Uint8Array ──────────────────────────────
// Cast explicite en ArrayBuffer pour satisfaire les types stricts TypeScript
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

export const subscribeToPush = async (zones: string[] = []): Promise<boolean> => {
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
        endpoint: subJson.endpoint,
        p256dh:   subJson.keys?.p256dh,
        auth:     subJson.keys?.auth,
        zones,
      }),
    })

    if (!response.ok) throw new Error('Erreur enregistrement subscription')

    localStorage.setItem('push-subscription-active', 'true')
    localStorage.setItem('push-subscription-endpoint', subJson.endpoint || '')

    return true
  } catch (err) {
    console.error('Erreur subscribe push:', err)
    return false
  }
}

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

    return true
  } catch (err) {
    console.error('Erreur unsubscribe push:', err)
    return false
  }
}

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

export const updatePushZones = async (zones: string[]): Promise<void> => {
  if (!isPushSupported()) return

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return

    const subJson = subscription.toJSON()

    await fetch(`${API_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        p256dh:   subJson.keys?.p256dh,
        auth:     subJson.keys?.auth,
        zones,
      }),
    })
  } catch (err) {
    console.error('Erreur update zones push:', err)
  }
}