'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings, Moon, Sun, Bell, BellOff, MapPin, LocateFixed, RefreshCw,
  Tag, Building2, Truck, Megaphone, Info, Trash2,
  ChevronRight, Loader2, CheckCircle, Shield,
} from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

type Preferences = {
  promotions: boolean
  resellers:  boolean
  delivery:   boolean
  broadcast:  boolean
}

const DEFAULT_PREFERENCES: Preferences = {
  promotions: true,
  resellers:  true,
  delivery:   true,
  broadcast:  true,
}

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

// ── Helpers push — inline pour éviter tout problème d'import ─────────────────

const isPushSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

// ── Obtenir le SW — forcer l'enregistrement si pas encore actif ──────────────
const getSwRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  try {
    // Forcer l'enregistrement du SW s'il n'est pas encore enregistré
    const registrations = await navigator.serviceWorker.getRegistrations()
    if (registrations.length === 0) {
      console.log('[Push] Aucun SW enregistré, tentative d\'enregistrement...')
      try {
        await navigator.serviceWorker.register('/sw.js')
      } catch (e) {
        console.log('[Push] Erreur enregistrement SW:', e)
      }
    }

    // Attendre que le SW soit prêt — timeout 10s
    const result = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => {
        console.log('[Push] Timeout SW après 10s')
        resolve(null)
      }, 10000)),
    ])

    console.log('[Push] SW registration:', result ? 'OK' : 'null')
    return result as ServiceWorkerRegistration | null
  } catch (err) {
    console.error('[Push] getSwRegistration error:', err)
    return null
  }
}

const isPushSubscribed = async (): Promise<boolean> => {
  try {
    const reg = await getSwRegistration()
    if (!reg) return false
    const sub = await reg.pushManager.getSubscription()
    return !!sub
  } catch {
    return false
  }
}

const urlBase64ToUint8Array = (base64String: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i)
  return output.buffer as ArrayBuffer
}

const subscribeToPush = async (zones: string[], preferences: Preferences): Promise<boolean> => {
  try {
    console.log('[Push] Notification.permission avant:', Notification.permission)

    if (Notification.permission === 'denied') {
      console.log('[Push] Permission déjà refusée')
      return false
    }

    const permission = await Notification.requestPermission()
    console.log('[Push] Permission après requestPermission:', permission)
    if (permission !== 'granted') return false

    console.log('[Push] Récupération SW...')
    const reg = await getSwRegistration()
    console.log('[Push] SW reg:', reg ? 'OK' : 'null')
    if (!reg) return false

    console.log('[Push] Récupération clé VAPID...')
    const vapidRes = await fetch(`${API_URL}/notifications/vapid-public-key`)
    const { publicKey } = await vapidRes.json()
    console.log('[Push] Clé VAPID:', publicKey ? 'OK' : 'manquante')
    if (!publicKey) return false

    console.log('[Push] Création subscription...')
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
    console.log('[Push] Subscription créée:', sub.endpoint.slice(0, 50))

    const subJson = sub.toJSON()
    console.log('[Push] Envoi au backend...')
    const res = await fetch(`${API_URL}/notifications/subscribe`, {
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
    console.log('[Push] Réponse backend:', res.status)
    if (!res.ok) return false

    localStorage.setItem('push-preferences', JSON.stringify(preferences))
    console.log('[Push] Abonnement réussi ✅')
    return true
  } catch (err) {
    console.error('[Push] subscribeToPush error:', err)
    return false
  }
}

const unsubscribeFromPush = async (): Promise<void> => {
  try {
    const reg = await getSwRegistration()
    if (!reg) return
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    await fetch(`${API_URL}/notifications/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    })
    await sub.unsubscribe()
    localStorage.removeItem('push-preferences')
  } catch (err) {
    console.error('unsubscribeFromPush error:', err)
  }
}

const updatePushPreferences = async (preferences: Preferences): Promise<void> => {
  try {
    const reg = await getSwRegistration()
    if (!reg) return
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    await fetch(`${API_URL}/notifications/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint, preferences }),
    })
    localStorage.setItem('push-preferences', JSON.stringify(preferences))
  } catch (err) {
    console.error('updatePushPreferences error:', err)
  }
}

const getStoredPreferences = (): Preferences => {
  try {
    const s = localStorage.getItem('push-preferences')
    if (s) {
      const p = JSON.parse(s)
      return {
        promotions: p.promotions ?? true,
        resellers:  p.resellers  ?? true,
        delivery:   p.delivery   ?? true,
        broadcast:  p.broadcast  ?? true,
      }
    }
  } catch {}
  return { ...DEFAULT_PREFERENCES }
}

// ── ThemeSwitcher inline ──────────────────────────────────────────────────────
const useTheme = () => {
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    setIsDark(localStorage.getItem('theme') !== 'light')
  }, [])
  const toggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    hapticFeedback('light')
  }
  return { isDark, toggle }
}

// ── Composants UI ─────────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 px-1">
      {title}
    </p>
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
      {children}
    </div>
  </div>
)

const ToggleRow = ({
  icon, label, sublabel, enabled, onToggle, loading = false, disabled = false,
}: {
  icon: React.ReactNode; label: string; sublabel?: string
  enabled: boolean; onToggle: () => void; loading?: boolean; disabled?: boolean
}) => (
  <div className="flex items-center gap-4 px-4 py-3.5">
    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">{label}</p>
      {sublabel && <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">{sublabel}</p>}
    </div>
    <button
      onClick={onToggle}
      disabled={loading || disabled}
      className={`relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
        enabled ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'
      } ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin absolute inset-0 m-auto" />
        : <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 absolute top-1 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      }
    </button>
  </div>
)

const ChevronRow = ({ icon, label, value, onClick }: {
  icon: React.ReactNode; label: string; value?: string; onClick?: () => void
}) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0 text-left">
      <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">{label}</p>
      {value && <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans truncate">{value}</p>}
    </div>
    <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
  </button>
)

// ── Page principale ───────────────────────────────────────────────────────────
export default function ParametresPage() {
  const router = useRouter()
  const { isDark, toggle: toggleTheme } = useTheme()

  const [mounted, setMounted]           = useState(false)
  const [pushSupported, setPushSupported]   = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [preferences, setPreferences]   = useState<Preferences>({ ...DEFAULT_PREFERENCES })
  const [loadingPush, setLoadingPush]   = useState(true)
  const [togglingMaster, setTogglingMaster] = useState(false)
  const [togglingPref, setTogglingPref] = useState<string | null>(null)
  const [zone, setZone]                 = useState<string | null>(null)
  const [isLocating, setIsLocating]     = useState(false)
  const [cacheCleared, setCacheCleared] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    loadZone()
    // Clear badge
    try { localStorage.setItem('push-unread-count', '0') } catch {}
    initNotifications()
  }, [mounted])

  const initNotifications = async () => {
    setLoadingPush(true)
    try {
      const supported = isPushSupported()
      setPushSupported(supported)
      if (supported) {
        const subscribed = await isPushSubscribed()
        setPushSubscribed(subscribed)
        if (subscribed) {
          setPreferences(getStoredPreferences())
        }
      }
    } catch (err) {
      console.error('initNotifications error:', err)
    } finally {
      // ── Toujours terminer le loading, même en cas d'erreur ──
      setLoadingPush(false)
    }
  }

  const loadZone = () => {
    try {
      const saved = localStorage.getItem('user-location')
      if (saved) setZone(saved)
    } catch {}
  }

  const handleMasterToggle = async () => {
    hapticFeedback('medium')
    setTogglingMaster(true)
    try {
      if (pushSubscribed) {
        await unsubscribeFromPush()
        setPushSubscribed(false)
      } else {
        const zones = zone ? [zone.split(',')[0].trim()] : []
        const success = await subscribeToPush(zones, preferences)
        if (success) {
          setPushSubscribed(true)
        } else {
          // ── Message précis selon l'état de permission ──
          const permState = Notification.permission
          console.log('[Push] Échec subscribe, permission state:', permState)
          if (permState === 'denied') {
            alert('Les notifications sont bloquées pour ce site.\n\nPour les activer :\n1. Appuyez sur le cadenas 🔒 dans la barre d\'adresse\n2. Autorisations du site → Notifications → Autoriser')
          } else {
            alert('Impossible d\'activer les alertes. Assurez-vous d\'être sur Chrome Android et réessayez.')
          }
        }
      }
    } catch (err) {
      console.error('handleMasterToggle error:', err)
    } finally {
      setTogglingMaster(false)
    }
  }

  const handlePrefToggle = async (key: keyof Preferences) => {
    if (!pushSubscribed) return
    hapticFeedback('light')
    setTogglingPref(key)
    const newPrefs: Preferences = { ...preferences, [key]: !preferences[key] }
    setPreferences(newPrefs)
    try {
      await updatePushPreferences(newPrefs)
    } catch {
      setPreferences(preferences)
    } finally {
      setTogglingPref(null)
    }
  }

  const handleDetectZone = useCallback(() => {
    if (!navigator.geolocation) return
    hapticFeedback('light')
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=fr`,
            { headers: { 'User-Agent': 'VitogazMadagascar/1.0' } }
          )
          const data = await res.json()
          const addr = data.address
          const label = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || addr.county || 'Localisation détectée'
          const region = addr.state || addr.region || ''
          const full = region ? `${label}, ${region}` : label
          setZone(full)
          localStorage.setItem('user-location', full)
          localStorage.setItem('user-location-timestamp', String(Date.now()))
        } finally {
          setIsLocating(false)
        }
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [])

  const handleClearCache = async () => {
    hapticFeedback('medium')
    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map(k => caches.delete(k)))
      }
      setCacheCleared(true)
      setTimeout(() => setCacheCleared(false), 3000)
    } catch {}
  }

  const notifTypes: { key: keyof Preferences; icon: React.ReactNode; label: string; sublabel: string }[] = [
    { key: 'promotions', icon: <Tag className="w-4 h-4 text-amber-500" strokeWidth={1.5} />, label: 'Promotions & offres', sublabel: 'Nouvelles promos Vitogaz' },
    { key: 'resellers',  icon: <Building2 className="w-4 h-4 text-primary" strokeWidth={1.5} />, label: 'Nouveaux revendeurs', sublabel: 'Points de vente près de vous' },
    { key: 'delivery',   icon: <Truck className="w-4 h-4 text-blue-500" strokeWidth={1.5} />, label: 'Nouvelles sociétés de livraison', sublabel: 'Livraison à domicile disponible' },
    { key: 'broadcast',  icon: <Megaphone className="w-4 h-4 text-purple-500" strokeWidth={1.5} />, label: 'Infos Vitogaz', sublabel: 'Annonces importantes' },
  ]

  if (!mounted) {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16 pb-24 md:pb-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl py-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-neutral-300" strokeWidth={1.5} />
            <div className="h-7 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-5">
              <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-2 animate-pulse" />
              <div className="bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-neutral-800 h-14 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16 pb-24 md:pb-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl py-6">

        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-neutral-700 dark:text-neutral-300" strokeWidth={1.5} />
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight font-sans">
            Paramètres
          </h1>
        </div>

        {/* Apparence */}
        <Section title="Apparence">
          <ToggleRow
            icon={isDark ? <Moon className="w-4 h-4 text-indigo-500" strokeWidth={1.5} /> : <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.5} />}
            label="Mode sombre"
            sublabel={isDark ? 'Thème sombre activé' : 'Thème clair activé'}
            enabled={isDark}
            onToggle={toggleTheme}
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          {loadingPush ? (
            <div className="flex items-center gap-3 px-4 py-4">
              <Loader2 className="w-4 h-4 text-primary animate-spin" strokeWidth={1.5} />
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans">Chargement...</p>
            </div>
          ) : !pushSupported ? (
            <div className="px-4 py-4 flex items-center gap-3">
              <BellOff className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans">
                Les notifications push ne sont pas supportées sur ce navigateur
              </p>
            </div>
          ) : (
            <>
              {/* ── Titre principal — Alertes activées ─────────────────────── */}
              <ToggleRow
                icon={pushSubscribed
                  ? <Bell className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  : <BellOff className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />}
                label="Alertes activées"
                sublabel={pushSubscribed ? 'Vous recevez des alertes' : 'Activez pour recevoir des alertes'}
                enabled={pushSubscribed}
                onToggle={handleMasterToggle}
                loading={togglingMaster}
              />

              {/* ── Titres secondaires — sous-préférences ──────────────────── */}
              {pushSubscribed && (
                <div className="bg-neutral-50 dark:bg-neutral-900/40 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-4 pt-3 pb-1">
                    Types d'alertes
                  </p>
                  {notifTypes.map((t) => (
                    <div key={t.key} className="pl-4 border-l-2 border-primary/20 ml-4 mr-2 rounded-l">
                      <ToggleRow
                        icon={t.icon}
                        label={t.label}
                        sublabel={t.sublabel}
                        enabled={preferences[t.key]}
                        onToggle={() => handlePrefToggle(t.key)}
                        loading={togglingPref === t.key}
                      />
                    </div>
                  ))}
                  <div className="pb-1" />
                </div>
              )}
            </>
          )}
        </Section>

        {/* Localisation */}
        <Section title="Localisation">
          <div className="flex items-center gap-4 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">Ma zone</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans truncate">
                {isLocating ? 'Détection en cours...' : zone || 'Non définie'}
              </p>
            </div>
            <button
              onClick={handleDetectZone}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              {isLocating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                : zone
                  ? <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                  : <LocateFixed className="w-3.5 h-3.5" strokeWidth={1.5} />
              }
              {isLocating ? 'Détection...' : zone ? 'Rafraîchir' : 'Détecter'}
            </button>
          </div>
        </Section>

        {/* Application */}
        <Section title="Application">
          <ChevronRow
            icon={<Trash2 className="w-4 h-4 text-red-500" strokeWidth={1.5} />}
            label="Vider le cache"
            value={cacheCleared ? '✓ Cache vidé' : "Libérer de l'espace"}
            onClick={handleClearCache}
          />
          <ChevronRow
            icon={<Shield className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />}
            label="Conditions d'utilisation"
            onClick={() => router.push('/fr/conditions')}
          />
        </Section>

        {/* À propos */}
        <Section title="À propos">
          <div className="px-4 py-3.5 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">Vito by Vitogaz</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">Version 1.0.0 — Madagascar</p>
            </div>
          </div>
          <div className="px-4 py-3.5 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">Leader du gaz depuis 25 ans</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">020 22 364 64 · Lun-Ven 8h-17h</p>
            </div>
          </div>
        </Section>

      </div>
    </main>
  )
}