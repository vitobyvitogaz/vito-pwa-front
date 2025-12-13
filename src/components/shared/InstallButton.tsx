'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    console.log('🔄 InstallButton mounted')
    
    const handler = (e: Event) => {
      console.log('✅ PWA install prompt available')
      e.preventDefault()
      setDeferredPrompt(e)
      setShowButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    // Vérifier si l'app est déjà installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    console.log('📱 Already installed as PWA?', isStandalone)
    
    if (isStandalone) {
      console.log('🔇 Hiding button - already installed')
      return
    }
    
    // AFFICHER TOUJOURS LE BOUTON EN PRODUCTION
    // Attendre 2 secondes puis afficher
    const timer = setTimeout(() => {
      console.log('⏰ Showing install button after delay')
      setShowButton(true)
    }, 2000)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    console.log('🖱️ Install button clicked')
    
    if (!deferredPrompt) {
      console.log('⚠️ No native prompt, showing manual instructions')
      
      // Instructions manuelles
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)
      
      if (isIOS) {
        alert(
          "Pour installer sur iOS :\n" +
          "1. Appuyez sur le bouton 'Partager' (📤)\n" +
          "2. Faites défiler vers le bas\n" +
          "3. Sélectionnez 'Sur l'écran d'accueil'"
        )
      } else if (isAndroid) {
        alert(
          "Pour installer sur Android :\n" +
          "1. Appuyez sur les trois points (⋮)\n" +
          "2. Sélectionnez 'Installer l'application'\n" +
          "3. Confirmez l'installation"
        )
      } else {
        alert(
          "Pour installer sur ordinateur :\n" +
          "1. Cliquez sur l'icône d'installation (📥) dans la barre d'adresse\n" +
          "2. Ou utilisez le menu Chrome > 'Installer l'application'"
        )
      }
      return
    }

    try {
      console.log('🚀 Triggering native install prompt')
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`📝 User choice: ${outcome}`)
      
      setDeferredPrompt(null)
      setShowButton(false)
      
    } catch (error) {
      console.error('❌ Install error:', error)
    }
  }

  if (!showButton) return null

  return (
    <button
      onClick={handleInstall}
      className="group bg-primary text-white rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Installer l'application"
    >
      <Download className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
      <span className="text-sm font-semibold">Installer</span>
    </button>
  )
}