'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 mx-auto max-w-sm">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <XMarkIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
        </button>

        <div className="flex items-start gap-3">
          <img src="/icons/icon-96x96.png" alt="Vito" className="w-12 h-12 rounded-2xl flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-0.5">
              Installer VITO
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
              Accès rapide depuis votre écran d'accueil
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all duration-300"
              >
                Installer
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}