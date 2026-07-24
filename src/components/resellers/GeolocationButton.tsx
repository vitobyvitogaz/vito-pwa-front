'use client'

import { useState, useEffect } from 'react'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { MapPin, AlertCircle } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface GeolocationButtonProps {
  onLocationFound: (location: { lat: number; lng: number }) => void
  onError?: () => void
}

export const GeolocationButton: React.FC<GeolocationButtonProps> = ({ onLocationFound, onError }) => {
  const { latitude, longitude, error, loading, getCurrentPosition } = useGeolocation()
  const [showError, setShowError] = useState(false)
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false)

  const handleClick = () => {
    hapticFeedback('medium')
    setHasRequestedLocation(true)
    getCurrentPosition()
  }

  useEffect(() => {
    if (hasRequestedLocation && latitude && longitude && !loading) {
      console.log('📍 [GeolocationButton] Position trouvée:', { lat: latitude, lng: longitude })
      onLocationFound({ lat: latitude, lng: longitude })
      setHasRequestedLocation(false)
    }
  }, [latitude, longitude, loading, hasRequestedLocation, onLocationFound])

  useEffect(() => {
    if (error) {
      onError?.()
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [error, onError])

  return (
    <div className="absolute bottom-6 right-6 z-10">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-12 h-12 rounded-xl bg-white dark:bg-dark-surface shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-300 hover:scale-110 disabled:opacity-50 flex items-center justify-center group hover:border-primary dark:hover:border-primary"
        title="Utiliser ma position"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <MapPin className="w-5 h-5 text-primary group-hover:text-primary/90 transition-colors" strokeWidth={1.5} />
        )}
      </button>

      {showError && (
        <div className="absolute bottom-16 right-0 w-64 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 shadow-sm animate-fade-up">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Activez la géolocalisation dans les paramètres de votre navigateur
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
