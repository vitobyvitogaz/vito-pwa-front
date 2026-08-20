'use client'

import { useState, useEffect } from 'react'
import { WifiSlash as WifiOff } from '@phosphor-icons/react'

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
    <div className="bg-amber-600 text-white px-4 py-3 text-center text-sm font-medium flex items-center justify-center gap-2 font-sans">
      <WifiOff className="w-5 h-5" strokeWidth={1.5} />
      <span>Vous êtes hors ligne. Certaines fonctionnalités sont limitées.</span>
    </div>
  )
}