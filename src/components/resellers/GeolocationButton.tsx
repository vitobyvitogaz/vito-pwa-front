'use client'

import { useState, useEffect } from 'react'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { MapPinIcon } from '@heroicons/react/24/solid'
import { hapticFeedback } from '@/lib/utils/haptic'

interface GeolocationButtonProps {
  onLocationFound: (location: { lat: number; lng: number }) => void
}

export const GeolocationButton: React.FC<GeolocationButtonProps> = ({ onLocationFound }) => {
  const { latitude, longitude, error, loading, getCurrentPosition } = useGeolocation()
  const [showError, setShowError] = useState(false)
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false)

  const handleClick = () => {
    hapticFeedback('medium')
    setHasRequestedLocation(true)
    getCurrentPosition()
  }

  // ✅ CORRECTION : Envoyer la position dès qu'elle est disponible
  useEffect(() => {
    if (hasRequestedLocation && latitude && longitude && !loading) {
      console.log('📍 [GeolocationButton] Position trouvée:', { lat: latitude, lng: longitude })
      onLocationFound({ lat: latitude, lng: longitude })
      setHasRequestedLocation(false) // Réinitialiser
    }
  }, [latitude, longitude, loading, hasRequestedLocation, onLocationFound])

  // Afficher l'erreur temporairement
  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="absolute bottom-6 right-6 z-10">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-14 h-14 rounded-full bg-white dark:bg-dark-surface shadow-xl border-2 border-neutral-200 dark:border-dark-border hover:shadow-2xl transition-all duration-300 hover:scale-110 disabled:opacity-50 flex items-center justify-center group"
        title="Utiliser ma position"
      >
        {loading ? (
          <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <MapPinIcon className="w-6 h-6 text-primary group-hover:text-primary-600 transition-colors" />
        )}
      </button>

      {showError && (
        <div className="absolute bottom-16 right-0 w-64 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {error}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Activez la géolocalisation dans les paramètres de votre navigateur
          </p>
        </div>
      )}
    </div>
  )
}