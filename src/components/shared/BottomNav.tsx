'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ShoppingCart, Sparkles, FileText, Download } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

const navItems = [
  { href: '/fr/revendeurs', label: 'Revendeurs', icon: MapPin },
  { href: '/fr/commander', label: 'Commander', icon: ShoppingCart },
  { href: '/fr/promotions', label: 'Promotions', icon: Sparkles },
  { href: '/fr/documents', label: 'Documents', icon: FileText },
]

export const BottomNav: React.FC = () => {
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Ne pas afficher si déjà installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    if (iOS) {
      setShowInstall(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    hapticFeedback('medium')

    if (isIOS) {
      alert(
        "📱 Installer Vito sur votre iPhone/iPad :\n\n" +
        "1. Appuyez sur le bouton Partager (📤) en bas de Safari\n" +
        "2. Faites défiler vers le bas\n" +
        "3. Sélectionnez 'Sur l'écran d'accueil'\n" +
        "4. Confirmez en appuyant sur 'Ajouter'"
      )
      return
    }

    if (!deferredPrompt) {
      const isAndroid = /Android/.test(navigator.userAgent)
      if (isAndroid) {
        alert(
          "📱 Installer Vito sur Android :\n\n" +
          "1. Appuyez sur les trois points (⋮) en haut à droite\n" +
          "2. Sélectionnez 'Installer l'application'\n" +
          "3. Confirmez l'installation"
        )
      } else {
        alert(
          "💻 Installer Vito :\n\n" +
          "1. Cliquez sur l'icône d'installation (📥) dans la barre d'adresse\n" +
          "2. Confirmez l'installation"
        )
      }
      return
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstall(false)
      }
    } catch (error) {
      console.error('Install error:', error)
    }
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[1002] bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border-t border-neutral-200/60 dark:border-dark-border/60"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className={`grid h-16 ${showInstall ? 'grid-cols-5' : 'grid-cols-4'}`}>

        {/* 4 nav items */}
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticFeedback('light')}
              className="flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90"
            >
              <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 dark:bg-primary/20'
                  : ''
              }`}>
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </div>
              <span className={`text-[10px] font-medium leading-none transition-colors duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Bouton Installer — conditionnel */}
        {showInstall && (
          <button
            onClick={handleInstall}
            className="flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90"
          >
            <div className="flex items-center justify-center w-10 h-7 rounded-full bg-primary/10 dark:bg-primary/20">
              <Download
                className="w-5 h-5 text-primary"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[10px] font-medium leading-none text-primary">
              Installer
            </span>
          </button>
        )}

      </div>
    </nav>
  )
}