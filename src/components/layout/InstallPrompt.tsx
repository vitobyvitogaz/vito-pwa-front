'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
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
    <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-dark-surface rounded-xl shadow-xl p-4 z-50 animate-slide-up">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3">
        <img src="/icons/icon-96x96.png" alt="Vito" className="w-12 h-12 rounded-lg" />
        <div className="flex-1">
          <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
            Installer Vito
          </h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
            Accès rapide depuis votre écran d'accueil
          </p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleInstall}>
              Installer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowPrompt(false)}>
              Plus tard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}