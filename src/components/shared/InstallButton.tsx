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
    // ── iOS : ouvrir le modal custom au lieu de alert() ──
    if (isIOS) {
      setShowIOSModal(true)
      return
    }

    if (!deferredPrompt) {
      const isAndroid = /Android/.test(navigator.userAgent)
      if (isAndroid) {
        // Android sans prompt natif : instructions courtes
        setShowIOSModal(true)
      }
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
        className="install-button group bg-primary text-white rounded-full px-4 py-2.5 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Installer l'application Vito"
      >
        <Download className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
        <span className="text-sm font-semibold">Installer</span>
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

      {/* Modal iOS custom */}
      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} />
      )}
    </>
  )
}