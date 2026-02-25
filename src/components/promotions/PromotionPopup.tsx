'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Promotion } from '@/types/promotion'
import { X, Tag, Clock, Sparkles, ArrowRight, Calendar } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionPopupProps {
  promotion: Promotion
  onClose: () => void
}

const POPUP_COOLDOWN_MINUTES = 0

export const PromotionPopup: React.FC<PromotionPopupProps> = ({ promotion, onClose }) => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const [isExpired, setIsExpired] = useState(false)
  const [copied, setCopied] = useState(false)
  const [progressWidth, setProgressWidth] = useState(100)
  const promoDurationRef = useRef<number | null>(null)

  useEffect(() => {
    const lastShown = localStorage.getItem('promotionPopupShown')
    const shouldShow = !lastShown ||
      (Date.now() - parseInt(lastShown)) / (1000 * 60) >= POPUP_COOLDOWN_MINUTES

    if (shouldShow) {
      setIsVisible(true)
      localStorage.setItem('promotionPopupShown', String(Date.now()))
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const end = new Date(promotion.valid_until).getTime()

    if (promoDurationRef.current === null) {
      const created = (promotion as any).created_at
        ? new Date((promotion as any).created_at).getTime()
        : Date.now() - 30 * 24 * 60 * 60 * 1000
      promoDurationRef.current = end - created
    }

    const calculateTimeLeft = () => {
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' })
        setProgressWidth(0)
        return
      }

      setProgressWidth(Math.min(100, Math.max(0, (diff / promoDurationRef.current!) * 100)))
      setTimeLeft({
        days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        minutes: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        seconds: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0'),
      })
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
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  const handleCTA = () => {
    hapticFeedback('medium')
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
      router.push(`/${locale}/promotions`)
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`relative w-full max-w-sm transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ animation: isClosing ? 'none' : 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(24px) scale(0.97); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
        `}</style>

        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden">

          {/* ── HEADER compact ── */}
          <div className="relative bg-gradient-to-r from-primary to-primary-600 px-5 py-3.5 flex items-center justify-between">

            {/* Badges alignés même hauteur */}
            <div className="flex items-center gap-2">
              <div className="h-7 flex items-center gap-1.5 px-3 bg-white/20 rounded-full">
                <span className="pulse-dot w-1.5 h-1.5 bg-white rounded-full" />
                <span className="text-xs font-semibold text-white tracking-wide">Promotion en cours</span>
              </div>
              {promotion.discount_value > 0 && (
                <div className="h-7 flex items-center px-3 bg-white rounded-full">
                  <span className="text-xs font-bold text-primary">
                    {promotion.discount_type === 'percentage'
                      ? `-${promotion.discount_value}%`
                      : `-${promotion.discount_value} Ar`}
                  </span>
                </div>
              )}
            </div>

            {/* Bouton fermer */}
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-all duration-200 hover:rotate-90 flex-shrink-0 ml-2"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </button>
          </div>

          {/* ── IMAGE — object-contain sur fond blanc ── */}
          {promotion.image_url ? (
            <div className="w-full bg-white flex items-center justify-center" style={{ height: '220px' }}>
              <img
                src={promotion.image_url}
                alt={promotion.title}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center" style={{ height: '120px' }}>
              <Sparkles className="w-12 h-12 text-primary/30" strokeWidth={1} />
            </div>
          )}

          {/* ── CORPS compact ── */}
          <div className="px-5 py-4">

            {/* Titre + description */}
            <h2 className="text-base font-bold text-neutral-900 dark:text-white font-sans leading-tight mb-1">
              {promotion.title}
            </h2>
            {promotion.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans line-clamp-2 mb-3">
                {promotion.description}
              </p>
            )}

            {/* Countdown redesigné */}
            {!isExpired ? (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  {/* Blocs temps */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { value: timeLeft.days, label: 'J' },
                      { value: timeLeft.hours, label: 'H' },
                      { value: timeLeft.minutes, label: 'M' },
                      { value: timeLeft.seconds, label: 'S' },
                    ].map((unit, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="flex flex-col items-center">
                          <div className="bg-neutral-900 dark:bg-white rounded-lg px-2.5 py-1 min-w-[2rem] text-center">
                            <span className="text-sm font-bold text-white dark:text-neutral-900 font-sans tabular-nums">
                              {unit.value}
                            </span>
                          </div>
                          <span className="text-[9px] text-neutral-400 font-sans mt-0.5">{unit.label}</span>
                        </div>
                        {i < 3 && <span className="text-neutral-400 font-bold text-sm mb-3">:</span>}
                      </div>
                    ))}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-400 font-sans">
                      {new Date(promotion.valid_until).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short'
                      })}
                    </span>
                  </div>
                </div>

                {/* Barre progression */}
                <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-600 rounded-full transition-all duration-1000"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <span className="text-xs text-red-600 dark:text-red-400 font-sans">Cette offre a expiré</span>
              </div>
            )}

            {/* Code promo */}
            {promotion.promo_code && promotion.is_active && !isExpired && (
              <button
                onClick={handleCopyCode}
                className="w-full mb-3 flex items-center justify-between px-3 py-2.5 bg-primary/5 hover:bg-primary/10 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tag className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-primary font-mono">{promotion.promo_code}</div>
                    <div className="text-[10px] text-neutral-400 font-sans">Code promotionnel</div>
                  </div>
                </div>
                <span className={`text-xs font-semibold font-sans transition-colors ${copied ? 'text-emerald-600' : 'text-primary'}`}>
                  {copied ? '✓ Copié' : 'Copier'}
                </span>
              </button>
            )}

            {/* CTA */}
            {!isExpired && (
              <button
                onClick={handleCTA}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-600 text-white rounded-2xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 font-sans group"
              >
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                Voir toutes les promos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}