'use client'

import { useState, useEffect } from 'react'
import { WifiSlash as WifiOff } from '@phosphor-icons/react'

/**
 * Pastille « hors ligne » affichée sur toutes les pages (montée dans le layout).
 * Placée en bas, au-dessus de la barre de navigation mobile, pour ne pas recouvrir le contenu.
 */
export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="pointer-events-none fixed bottom-24 md:bottom-6 left-0 right-0 z-[1003] flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-medium text-white shadow-md font-sans"
      >
        <WifiOff className="w-5 h-5 flex-shrink-0" />
        <span>Hors ligne : les contenus déjà consultés restent disponibles.</span>
      </div>
    </div>
  )
}
