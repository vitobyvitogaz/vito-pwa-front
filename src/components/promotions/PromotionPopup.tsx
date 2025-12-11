'use client'

import { useState, useEffect } from 'react'
import type { Promotion } from '@/types/promotion'
import { 
  XMarkIcon, 
  TagIcon, 
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/solid'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionPopupProps {
  promotion: Promotion
  onClose: () => void
}

export const PromotionPopup: React.FC<PromotionPopupProps> = ({ promotion, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(promotion.validUntil).getTime()
      const diff = end - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('00:00:00:00')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      const formatted = `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      setTimeLeft(formatted)
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    // Auto-close après 15 secondes
    const autoCloseTimer = setTimeout(() => {
      handleClose()
    }, 15000)

    return () => {
      clearInterval(interval)
      clearTimeout(autoCloseTimer)
    }
  }, [promotion.validUntil])

  const handleCopyCode = () => {
    if (!promotion.code) return
    
    hapticFeedback('medium')
    navigator.clipboard.writeText(promotion.code)
    setCopied(true)
    
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    hapticFeedback('light')
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md animate-slide-up">
        {/* Contenu principal */}
        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-dark-border">
          {/* Image en pleine hauteur */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={promotion.image}
              alt={promotion.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            {/* Badge discount si > 0 */}
            {promotion.discount > 0 && (
              <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-600 rounded-2xl blur-md opacity-75" />
                  <div className="relative bg-gradient-to-br from-accent to-accent-600 text-white rounded-2xl px-5 py-3 shadow-2xl">
                    <div className="text-3xl font-bold leading-none">-{promotion.discount}%</div>
                    <div className="text-xs font-semibold opacity-90 mt-1">OFFRE</div>
                  </div>
                </div>
              </div>
            )}

            {/* Titre sur image */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h2 className="text-2xl font-bold text-white mb-1 line-clamp-2">
                {promotion.title}
              </h2>
              <p className="text-white/90 text-sm line-clamp-2">
                {promotion.description}
              </p>
            </div>
          </div>

          {/* Contenu sous l'image */}
          <div className="p-6">
            {/* Timer et statut - Format digital strict */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {isExpired ? 'Offre expirée' : 'Temps restant'}
                    </p>
                    {!isExpired && (
                      <p className="text-lg font-bold text-neutral-900 dark:text-white font-mono tracking-tighter">
                        {timeLeft}
                      </p>
                    )}
                  </div>
                </div>

                {promotion.isActive && !isExpired && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    <SparklesIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">Active</span>
                  </div>
                )}
              </div>

              {/* Barre de progression du temps */}
              {!isExpired && (
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-600 rounded-full transition-all duration-1000"
                    style={{ width: '75%' }}
                  />
                </div>
              )}
            </div>

            {/* Code promo - Élément principal */}
            {promotion.code && promotion.isActive && !isExpired && (
              <div className="relative group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Code promotionnel
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-sm text-primary dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
                  >
                    {copied ? 'Copié !' : 'Cliquez pour copier'}
                  </button>
                </div>
                
                <button
                  onClick={handleCopyCode}
                  className="w-full"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 rounded-xl blur-sm group-hover:blur-md transition-all duration-300" />
                    <div className="relative flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl border-2 border-primary/20 dark:border-primary/30 group-hover:border-primary/40 dark:group-hover:border-primary/50 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TagIcon className="w-5 h-5 text-primary dark:text-primary-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-2xl font-bold text-primary dark:text-primary-400 font-mono">
                            {promotion.code}
                          </div>
                          <div className="text-xs text-primary/70 dark:text-primary-300">
                            Valide jusqu'au {new Date(promotion.validUntil).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Note */}
            <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-8">
              Fermez avec le bouton X en haut à droite
            </p>
          </div>
        </div>

        {/* Bouton fermer (X en haut à droite) */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-dark-surface rounded-full shadow-lg border border-neutral-200 dark:border-dark-border flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Fermer"
        >
          <XMarkIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        </button>
      </div>
    </div>
  )
}