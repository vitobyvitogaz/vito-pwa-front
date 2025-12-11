'use client'

import { useState, useEffect } from 'react'
import { WifiIcon } from '@heroicons/react/24/outline'

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
    <div className="bg-warning text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <WifiIcon className="w-5 h-5" />
      Vous êtes hors ligne. Certaines fonctionnalités sont limitées.
    </div>
  )
}