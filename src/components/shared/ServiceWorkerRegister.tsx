'use client'

import { useEffect } from 'react'

/**
 * Enregistre le service worker (/sw.js) pour tous les visiteurs : mode hors ligne
 * et notifications. Désactivé en développement pour ne pas mettre de fichiers en cache
 * pendant le travail.
 */
export const ServiceWorkerRegister: React.FC = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('[SW] Enregistrement impossible:', error)
      })
    }

    if (document.readyState === 'complete') {
      register()
      return
    }
    window.addEventListener('load', register, { once: true })
    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
