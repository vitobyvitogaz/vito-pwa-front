'use client'

import { useState, useEffect } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'

export const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    // EN DÉVELOPPEMENT : Toujours afficher le bouton pour tester l'UI
    if (process.env.NODE_ENV === 'development') {
      setShowButton(true)
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("L'installation PWA n'est disponible qu'en production (HTTPS)")
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setShowButton(false)
  }

  if (!showButton) return null

  return (
    <button
      onClick={handleInstall}
      className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary-600 text-white rounded-full px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
      
      {/* Texte caché sur très petit mobile, visible sur sm+ */}
      <span className="hidden xs:inline text-xs sm:text-sm font-semibold relative z-10">Installer</span>
      <span className="xs:hidden text-xs font-semibold relative z-10">Installer</span>
    </button>
  )
}