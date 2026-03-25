'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, MapPin, ChevronRight, Zap, LocateFixed, Loader2 } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'
import {
  isPushSupported,
  isPushSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
  updatePushZones,
} from '@/lib/webpush'

const LOCATION_TTL_MS = 24 * 60 * 60 * 1000 // 24h

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      { headers: { 'User-Agent': 'VitogazMadagascar/1.0' } }
    )
    const data = await response.json()
    const address = data.address

    const locality =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.city_district ||
      address.county ||
      null

    const region = address.state || address.region || null

    if (locality && region) return `${locality}, ${region}`
    if (locality) return locality
    if (region) return region
    return 'Localisation détectée'
  } catch {
    return 'Localisation indisponible'
  }
}

// Extraire la ville depuis le label "Ville, Région"
const extractCity = (label: string): string => label.split(',')[0].trim()

export const NotificationToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [location, setLocation] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [pushSupported, setPushSupported] = useState(true)

  useEffect(() => {
    initializeState()
  }, [])

  const initializeState = async () => {
    setIsLoading(true)

    // Vérifier support push
    const supported = isPushSupported()
    setPushSupported(supported)

    // Vérifier si déjà abonné
    if (supported) {
      const subscribed = await isPushSubscribed()
      setIsEnabled(subscribed)
    }

    // Charger la localisation
    const savedLocation = localStorage.getItem('user-location')
    const savedTimestamp = localStorage.getItem('user-location-timestamp')
    const isExpired = !savedTimestamp || Date.now() - parseInt(savedTimestamp) > LOCATION_TTL_MS

    if (savedLocation && !isExpired) {
      setLocation(savedLocation)
    } else {
      detectLocation()
    }

    setIsLoading(false)
  }

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setLocation('Géolocalisation non supportée')
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const label = await reverseGeocode(latitude, longitude)
        setLocation(label)
        localStorage.setItem('user-location', label)
        localStorage.setItem('user-location-timestamp', String(Date.now()))
        localStorage.setItem('user-coords', JSON.stringify({ lat: latitude, lng: longitude }))
        setIsLocating(false)

        // Si déjà abonné, mettre à jour les zones
        if (isEnabled) {
          await updatePushZones([extractCity(label)])
        }
      },
      () => {
        setLocation('Localisation non disponible')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleRelancer = () => {
    hapticFeedback('light')
    localStorage.removeItem('user-location')
    localStorage.removeItem('user-location-timestamp')
    localStorage.removeItem('user-coords')
    detectLocation()
  }

  const handleToggle = async () => {
    if (!pushSupported) return
    hapticFeedback('medium')
    setIsToggling(true)

    try {
      if (isEnabled) {
        // ── Désabonner ──
        const success = await unsubscribeFromPush()
        if (success) setIsEnabled(false)
      } else {
        // ── S'abonner avec les zones détectées ──
        const zones = location && location !== 'Localisation non disponible'
          ? [extractCity(location)]
          : []

        const success = await subscribeToPush(zones)
        if (success) {
          setIsEnabled(true)
        } else {
          // Permission refusée ou erreur
          alert('Pour activer les alertes, autorisez les notifications dans les paramètres de votre navigateur.')
        }
      }
    } catch (err) {
      console.error('Erreur toggle notifications:', err)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isEnabled
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-neutral-100 dark:bg-neutral-800'
            }`}>
              {isEnabled ? (
                <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              ) : (
                <BellOff className="w-6 h-6 text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white font-sans mb-1">
                Alertes promotions
              </h3>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 font-sans truncate">
                  {isLocating ? 'Détection en cours...' : location ?? 'Localisation inconnue'}
                </span>
                {!isLocating && (
                  <button
                    onClick={handleRelancer}
                    className="flex-shrink-0 w-11 h-11 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors active:scale-90"
                    title="Relancer la détection"
                  >
                    <LocateFixed className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-3 font-sans">
            {!pushSupported
              ? 'Les notifications ne sont pas supportées sur ce navigateur'
              : isEnabled
                ? 'Vous serez alerté des nouvelles promotions dans votre zone'
                : 'Activez pour être notifié des offres près de chez vous'
            }
          </p>

          {isEnabled && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-sans">
                Alertes activées · {location ? extractCity(location) : 'toutes zones'}
              </span>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={isLoading || isToggling || !pushSupported}
          className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${
            isEnabled
              ? 'bg-emerald-500'
              : 'bg-neutral-300 dark:bg-neutral-700'
          } ${(isLoading || isToggling || !pushSupported) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 text-white animate-spin mx-auto" strokeWidth={2} />
          ) : (
            <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
              isEnabled ? 'translate-x-7' : 'translate-x-1'
            }`} />
          )}
        </button>
      </div>

      {/* Info line */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-500 flex-1 font-sans">
          Alertes en temps réel • Basées sur votre localisation • Notification push native
        </p>
        <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600" strokeWidth={1.5} />
      </div>
    </div>
  )
}