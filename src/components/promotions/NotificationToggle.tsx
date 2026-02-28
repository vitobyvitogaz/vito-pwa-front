'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, MapPin, ChevronRight, Zap, LocateFixed } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      { headers: { 'User-Agent': 'VitogazMadagascar/1.0' } }
    )
    const data = await response.json()
    const address = data.address

    // Priorité : suburb > city_district > city > town > village > county
    const locality =
      address.suburb ||
      address.city_district ||
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      null

    const region =
      address.state ||
      address.region ||
      null

    if (locality && region) return `${locality}, ${region}`
    if (locality) return locality
    if (region) return region
    return 'Localisation détectée'
  } catch {
    return 'Localisation indisponible'
  }
}

export const NotificationToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [location, setLocation] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedPreference = localStorage.getItem('promo-notifications')
    const savedLocation = localStorage.getItem('user-location')

    if (savedLocation) {
      setLocation(savedLocation)
      setIsLoading(false)
    } else {
      detectLocation()
    }

    checkNotificationPermission(savedPreference === 'true')
  }, [])

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setLocation('Géolocalisation non supportée')
      setIsLoading(false)
      return
    }

    setIsLocating(true)
    setIsLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const label = await reverseGeocode(latitude, longitude)
        setLocation(label)
        localStorage.setItem('user-location', label)
        localStorage.setItem('user-coords', JSON.stringify({ lat: latitude, lng: longitude }))
        setIsLocating(false)
        setIsLoading(false)
      },
      () => {
        setLocation('Localisation non disponible')
        setIsLocating(false)
        setIsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const checkNotificationPermission = (savedState: boolean) => {
    if (savedState && Notification.permission === 'granted') {
      setIsEnabled(true)
    } else if (Notification.permission === 'denied') {
      setIsEnabled(false)
      localStorage.setItem('promo-notifications', 'false')
    }
  }

  const handleToggle = async () => {
    hapticFeedback('medium')
    if (!isEnabled) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
    }
    const newState = !isEnabled
    setIsEnabled(newState)
    localStorage.setItem('promo-notifications', String(newState))
    window.dispatchEvent(new CustomEvent('notification-preference-changed', {
      detail: { enabled: newState }
    }))
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
                {/* Bouton relancer la détection */}
                {!isLocating && (
                  <button
                    onClick={detectLocation}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    title="Relancer la détection"
                  >
                    <LocateFixed className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-3 font-sans">
            {isEnabled
              ? 'Vous serez alerté des nouvelles promotions dans votre zone'
              : 'Activez pour être notifié des offres près de chez vous'
            }
          </p>

          {isEnabled && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-sans">Prêt à recevoir les alertes</span>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${
            isEnabled
              ? 'bg-emerald-500'
              : 'bg-neutral-300 dark:bg-neutral-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
            isEnabled ? 'translate-x-7' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Info line */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-500 flex-1 font-sans">
          Alertes en temps réel • Basées sur votre localisation • Notification push & in-app
        </p>
        <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600" strokeWidth={1.5} />
      </div>
    </div>
  )
}