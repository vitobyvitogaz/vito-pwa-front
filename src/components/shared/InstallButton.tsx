'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { IOSInstallModal } from '@/components/shared/IOSInstallModal'

export const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showButton, setShowButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    if (iOS) {
      setShowButton(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true)
      return
    }

    if (!deferredPrompt) {
      const isAndroid = /Android/.test(navigator.userAgent)
      if (isAndroid) setShowIOSModal(true)
      return
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowButton(false)
      }
    } catch (error) {
      console.error('Install error:', error)
    }
  }

  if (!showButton) return null

  return (
    <>
      <button
        onClick={handleInstall}
        aria-label="Installer l'application Vito"
        className="install-button group bg-primary text-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 sm:gap-2"
      >
        <Download className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={1.5} />
        <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">Installer</span>
        <style jsx>{`
          .install-button {
            animation: fadeIn 300ms ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </button>

      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} />
      )}
    </>
  )
}