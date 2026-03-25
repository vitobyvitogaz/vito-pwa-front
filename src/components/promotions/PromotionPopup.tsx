'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import type { Promotion } from '@/types/promotion'
import { X, Tag, Sparkles, ArrowRight, Calendar } from 'lucide-react'
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

  const getUrgencyColor = () => {
    if (isExpired) return { text: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800' }
    const diff = new Date(promotion.valid_until).getTime() - Date.now()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 7) return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
    if (days > 3) return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' }
    return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' }
  }

  const urgency = getUrgencyColor()

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

          {/* ── IMAGE — Next.js Image quality=72 priority (popup = above fold) ── */}
          <div className="relative w-full aspect-[4/5] overflow-hidden">
            {promotion.image_url ? (
              <Image
                src={promotion.image_url}
                alt={promotion.title}
                fill
                quality={72}
                priority
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 384px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary/30" strokeWidth={1} />
              </div>
            )}

            {/* Gradient bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Bouton fermer — w-11 h-11 = 44px ✅ */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-200 hover:rotate-90 active:scale-90"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-white" strokeWidth={2} />
            </button>

            {/* Badge remise */}
            {promotion.discount_value > 0 && (
              <div className="absolute top-3 left-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/40 rounded-xl blur-sm" />
                  <div className="relative bg-primary text-white rounded-xl px-3 py-1.5 shadow-lg">
                    <span className="text-base font-bold font-sans leading-none">
                      {promotion.discount_type === 'percentage'
                        ? `-${promotion.discount_value}%`
                        : `-${promotion.discount_value} Ar`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Badge En cours */}
            <div className="absolute top-3 right-16">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/20">
                <span className="pulse-dot w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-xs font-semibold text-white">En cours</span>
              </div>
            </div>

            {/* Titre + description sur image */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-lg font-bold text-white font-sans leading-tight line-clamp-2 drop-shadow-sm mb-1">
                {promotion.title}
              </h2>
              {promotion.description && (
                <p className="text-sm text-white/75 font-sans line-clamp-1 drop-shadow-sm">
                  {promotion.description}
                </p>
              )}
              {/* Barre de progression */}
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000 rounded-full"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── CORPS ── */}
          <div className="px-5 py-4 space-y-3">

            {/* Countdown */}
            {!isExpired ? (
              <div className={`rounded-xl p-3 border ${urgency.bg} border-transparent`}>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { value: timeLeft.days, label: 'Jours' },
                      { value: timeLeft.hours, label: 'Heures' },
                      { value: timeLeft.minutes, label: 'Min' },
                      { value: timeLeft.seconds, label: 'Sec' },
                    ].map((unit, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="min-w-[2rem] text-center">
                          <span className={`text-base font-bold tabular-nums font-sans ${urgency.text}`}>
                            {unit.value}
                          </span>
                        </div>
                        <span className={`text-[10px] mt-0.5 font-medium font-sans ${urgency.text} opacity-60`}>
                          {unit.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 pl-3 border-l border-neutral-200 dark:border-neutral-700">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-400 font-sans">
                      {new Date(promotion.valid_until).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900">
                <span className="text-xs text-red-600 dark:text-red-400 font-sans">Cette offre a expiré</span>
              </div>
            )}

            {/* Code promo */}
            {promotion.promo_code && promotion.is_active && !isExpired && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-primary/10">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                    <span className="text-xs font-semibold text-primary/70 uppercase tracking-wider font-sans">
                      Code promo
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Tag className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="text-lg font-black text-primary font-mono tracking-widest">
                      {promotion.promo_code}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold font-sans transition-colors px-2.5 py-1 rounded-lg ${
                    copied
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {copied ? '✓ Copié' : 'Copier'}
                  </span>
                </button>
              </div>
            )}

            {/* CTA */}
            {!isExpired && (
              <button
                onClick={handleCTA}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 font-sans group active:scale-95"
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