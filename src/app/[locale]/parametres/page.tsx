'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings, Moon, Sun, Bell, BellOff, MapPin, LocateFixed, RefreshCw,
  Tag, Building2, Truck, Megaphone, Info, Trash2,
  ChevronRight, Loader2, CheckCircle, Shield,
} from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

// ── Type des préférences ──────────────────────────────────────────────────────
type Preferences = {
  promotions: boolean
  resellers:  boolean
  delivery:   boolean
  broadcast:  boolean
}

// ── Imports webpush dynamiques pour éviter les erreurs SSR ───────────────────
// Ces fonctions utilisent window/navigator qui n'existent pas côté serveur
let webpushModule: typeof import('@/lib/webpush') | null = null
const getWebpush = async () => {
  if (!webpushModule) {
    webpushModule = await import('@/lib/webpush')
  }
  return webpushModule
}

// ── ThemeSwitcher inline ──────────────────────────────────────────────────────
const useTheme = () => {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    setIsDark(theme !== 'light')
  }, [])

  const toggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    hapticFeedback('light')
  }

  return { isDark, toggle }
}

// ── Section card ──────────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 px-1">
      {title}
    </p>
    {/* ── rounded-xl au lieu de rounded-2xl ── */}
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
      {children}
    </div>
  </div>
)

// ── Ligne toggle ──────────────────────────────────────────────────────────────
const ToggleRow = ({
  icon, label, sublabel, enabled, onToggle, loading = false, disabled = false,
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  enabled: boolean
  onToggle: () => void
  loading?: boolean
  disabled?: boolean
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
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 text-white animate-spin absolute inset-0 m-auto" />
      ) : (
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 absolute top-1 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      )}
    </button>
  </div>
)

// ── Ligne chevron ─────────────────────────────────────────────────────────────
const ChevronRow = ({
  icon, label, value, onClick,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
  >
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

  // ── Fix SSR : monté uniquement côté client ───────────────────────────────
  const [mounted, setMounted] = useState(false)

  const [pushSupported, setPushSupported]   = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [preferences, setPreferences]       = useState<Preferences>({
    promotions: true, resellers: true, delivery: true, broadcast: true,
  })
  const [loadingPush, setLoadingPush]       = useState(true)
  const [togglingMaster, setTogglingMaster] = useState(false)
  const [togglingPref, setTogglingPref]     = useState<string | null>(null)

  const [zone, setZone]             = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [cacheCleared, setCacheCleared] = useState(false)

  // ── Monter côté client uniquement ────────────────────────────────────────
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    initNotifications()
    loadZone()

    // Clear badge non lu
    getWebpush().then(m => m.clearUnreadCount())
  }, [mounted])

  const initNotifications = async () => {
    setLoadingPush(true)
    try {
      const m = await getWebpush()
      const supported = m.isPushSupported()
      setPushSupported(supported)

      if (supported) {
        const subscribed = await m.isPushSubscribed()
        setPushSubscribed(subscribed)
        if (subscribed) {
          const stored = m.getStoredPreferences()
          setPreferences({
            promotions: stored.promotions ?? true,
            resellers:  stored.resellers  ?? true,
            delivery:   stored.delivery   ?? true,
            broadcast:  stored.broadcast  ?? true,
          })
        }
      }
    } finally {
      setLoadingPush(false)
    }
  }

  const loadZone = () => {
    const saved = localStorage.getItem('user-location')
    if (saved) setZone(saved)
  }

  const handleMasterToggle = async () => {
    hapticFeedback('medium')
    setTogglingMaster(true)
    try {
      const m = await getWebpush()
      if (pushSubscribed) {
        await m.unsubscribeFromPush()
        setPushSubscribed(false)
      } else {
        const zones = zone ? [zone.split(',')[0].trim()] : []
        const success = await m.subscribeToPush(zones, preferences)
        if (success) {
          setPushSubscribed(true)
        } else {
          alert('Pour activer les alertes, autorisez les notifications dans les paramètres de votre navigateur.')
        }
      }
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
      const m = await getWebpush()
      await m.updatePushPreferences(newPrefs)
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
          const label =
            addr.city || addr.town || addr.village || addr.suburb ||
            addr.city_district || addr.county || 'Localisation détectée'
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
        await Promise.all(keys.map(key => caches.delete(key)))
      }
      setCacheCleared(true)
      setTimeout(() => setCacheCleared(false), 3000)
    } catch (err) {
      console.error('Erreur vidage cache:', err)
    }
  }

  const notifTypes: { key: keyof Preferences; icon: React.ReactNode; label: string; sublabel: string }[] = [
    {
      key:      'promotions',
      icon:     <Tag className="w-4 h-4 text-amber-500" strokeWidth={1.5} />,
      label:    'Promotions & offres',
      sublabel: 'Nouvelles promos Vitogaz',
    },
    {
      key:      'resellers',
      icon:     <Building2 className="w-4 h-4 text-primary" strokeWidth={1.5} />,
      label:    'Nouveaux revendeurs',
      sublabel: 'Points de vente près de vous',
    },
    {
      key:      'delivery',
      icon:     <Truck className="w-4 h-4 text-blue-500" strokeWidth={1.5} />,
      label:    'Nouvelles sociétés de livraison',
      sublabel: 'Livraison à domicile disponible',
    },
    {
      key:      'broadcast',
      icon:     <Megaphone className="w-4 h-4 text-purple-500" strokeWidth={1.5} />,
      label:    'Infos Vitogaz',
      sublabel: 'Annonces importantes',
    },
  ]

  // ── Pendant le SSR : skeleton minimaliste ────────────────────────────────
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
            icon={isDark
              ? <Moon className="w-4 h-4 text-indigo-500" strokeWidth={1.5} />
              : <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            }
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
                Les notifications ne sont pas supportées sur ce navigateur
              </p>
            </div>
          ) : (
            <>
              <ToggleRow
                icon={pushSubscribed
                  ? <Bell className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  : <BellOff className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                }
                label="Alertes activées"
                sublabel={pushSubscribed ? 'Vous recevez des alertes' : 'Activez pour recevoir des alertes'}
                enabled={pushSubscribed}
                onToggle={handleMasterToggle}
                loading={togglingMaster}
              />
              {pushSubscribed && notifTypes.map((t) => (
                <ToggleRow
                  key={t.key}
                  icon={t.icon}
                  label={t.label}
                  sublabel={t.sublabel}
                  enabled={preferences[t.key]}
                  onToggle={() => handlePrefToggle(t.key)}
                  loading={togglingPref === t.key}
                />
              ))}
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
            {/* ── Label dynamique : Rafraîchir si zone déjà connue, Détecter sinon ── */}
            <button
              onClick={handleDetectZone}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
              ) : zone ? (
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
              ) : (
                <LocateFixed className="w-3.5 h-3.5" strokeWidth={1.5} />
              )}
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
              <p className="text-sm font-medium text-neutral-900 dark:text-white font-sans">
                Leader du gaz depuis 25 ans
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                020 22 364 64 · Lun-Ven 8h-17h
              </p>
            </div>
          </div>
        </Section>

      </div>
    </main>
  )
}