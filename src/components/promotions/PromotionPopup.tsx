'use client'

import { useState, useEffect } from 'react'
import type { Promotion } from '@/types/promotion'
import { X, Tag, Clock, Sparkles } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionPopupProps {
  promotion: Promotion
  onClose: () => void
}

export const PromotionPopup: React.FC<PromotionPopupProps> = ({ promotion, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Vérifier si c'est la première ouverture
    const hasPopupBeenShown = localStorage.getItem('promotionPopupShown')
    
    if (!hasPopupBeenShown) {
      setIsVisible(true)
      localStorage.setItem('promotionPopupShown', 'true')
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(promotion.valid_until).getTime()
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
    const autoCloseTimer = setTimeout(() => handleClose(), 15000)

    return () => {
      clearInterval(interval)
      clearTimeout(autoCloseTimer)
    }
  }, [promotion.valid_until, isVisible])

  const handleCopyCode = () => {
    if (!promotion.promo_code) return
    hapticFeedback('medium')
    navigator.clipboard.writeText(promotion.promo_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    hapticFeedback('light')
    setIsVisible(false)
    setTimeout(() => onClose(), 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
          <div className="relative h-64 overflow-hidden">
            <img
              src={promotion.image_url || '/images/promotions/default.jpg'}
              alt={promotion.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            {promotion.discount_value > 0 && (
              <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-md" />
                  <div className="relative bg-primary text-white rounded-2xl px-5 py-3 shadow-lg">
                    <div className="text-2xl font-bold leading-none font-sans">
                      {promotion.discount_type === 'percentage' ? `-${promotion.discount_value}%` : `-${promotion.discount_value} Ar`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h2 className="text-xl font-semibold text-white mb-1 line-clamp-2 font-sans">
                {promotion.title}
              </h2>
              <p className="text-white/90 text-sm line-clamp-2 font-sans">
                {promotion.description}
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                      {isExpired ? 'Offre expirée' : 'Temps restant'}
                    </p>
                    {!isExpired && (
                      <p className="text-lg font-semibold text-neutral-900 dark:text-white font-mono tracking-tight">
                        {timeLeft}
                      </p>
                    )}
                  </div>
                </div>

                {promotion.is_active && !isExpired && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium font-sans">Active</span>
                  </div>
                )}
              </div>

              {!isExpired && (
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: '75%' }}
                  />
                </div>
              )}
            </div>

            {promotion.promo_code && promotion.is_active && !isExpired && (
              <div className="relative group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-sans">
                    Code promotionnel
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-sm text-primary hover:text-primary-600 transition-colors font-sans"
                  >
                    {copied ? 'Copié !' : 'Cliquez pour copier'}
                  </button>
                </div>
                
                <button onClick={handleCopyCode} className="w-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-xl blur-sm group-hover:blur transition-all duration-300" />
                    <div className="relative flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Tag className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-semibold text-primary font-mono">
                            {promotion.promo_code}
                          </div>
                          <div className="text-xs text-primary/70 font-sans">
                            Valide jusqu'au {new Date(promotion.valid_until).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-6 font-sans">
              Fermez avec le bouton X en haut à droite
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-dark-surface rounded-full shadow-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:scale-110 transition-transform duration-200"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-neutral-700 dark:text-neutral-300" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}