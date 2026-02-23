'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showButton, setShowButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    console.log('🔄 InstallButton mounted')
    
    // Vérifier si l'app est déjà installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    console.log('📱 Already installed as PWA?', isStandalone)
    
    if (isStandalone) {
      console.log('🔇 Button hidden - already installed')
      return // Ne pas afficher le bouton si déjà installé
    }
    
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)
    
    if (iOS) {
      // Sur iOS, afficher le bouton immédiatement (pas de beforeinstallprompt)
      console.log('🍎 iOS detected - showing manual install button')
      setShowButton(true)
      return
    }
    
    // Sur les autres navigateurs, écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      console.log('✅ PWA install prompt available')
      e.preventDefault()
      setDeferredPrompt(e)
      setShowButton(true) // Affichage immédiat (pas de timer)
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    console.log('🖱️ Install button clicked')
    
    // Cas iOS : Instructions manuelles
    if (isIOS) {
      console.log('🍎 Showing iOS install instructions')
      alert(
        "📱 Installer VIto sur votre iPhone/iPad :\n\n" +
        "1. Appuyez sur le bouton Partager (📤) en bas de Safari\n" +
        "2. Faites défiler vers le bas\n" +
        "3. Sélectionnez 'Sur l'écran d'accueil'\n" +
        "4. Confirmez en appuyant sur 'Ajouter'"
      )
      return
    }
    
    // Cas où l'événement n'est pas disponible
    if (!deferredPrompt) {
      console.log('⚠️ No native prompt available, showing manual instructions')
      
      const isAndroid = /Android/.test(navigator.userAgent)
      
      if (isAndroid) {
        alert(
          "📱 Installer VIto sur votre téléphone Android :\n\n" +
          "1. Appuyez sur les trois points (⋮) en haut à droite\n" +
          "2. Sélectionnez 'Installer l'application'\n" +
          "3. Confirmez l'installation"
        )
      } else {
        alert(
          "💻 Installer VIto sur votre ordinateur :\n\n" +
          "1. Cliquez sur l'icône d'installation (📥) dans la barre d'adresse\n" +
          "2. Ou utilisez le menu Chrome > 'Installer VIto'\n" +
          "3. Confirmez l'installation"
        )
      }
      return
    }

    // Déclencher l'installation native
    try {
      console.log('🚀 Triggering native install prompt')
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`📝 User choice: ${outcome}`)
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install')
      } else {
        console.log('❌ User dismissed the install')
      }
      
      // Nettoyer après l'installation
      setDeferredPrompt(null)
      setShowButton(false)
      
    } catch (error) {
      console.error('❌ Install error:', error)
    }
  }

  // Ne rien afficher si le bouton ne doit pas être visible
  if (!showButton) return null

  return (
    <button
      onClick={handleInstall}
      className="install-button group bg-primary text-white rounded-full px-4 py-2.5 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Installer l'application VIto"
    >
      <Download className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
      <span className="text-sm font-semibold">Installer</span>
      
      {/* Animation fade-in avec CSS */}
      <style jsx>{`
        .install-button {
          animation: fadeIn 300ms ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </button>
  )
}