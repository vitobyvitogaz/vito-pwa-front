'use client'

import { useState, useEffect, useRef } from 'react'
import type { Promotion } from '@/types/promotion'
import { Tag, Check, CalendarDays, Share, MapPin, Zap } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionCardProps {
  promotion: Promotion
  delay?: number
}

export const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, delay = 0 }) => {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const [isExpired, setIsExpired] = useState(false)
  const [copied, setCopied] = useState(false)
  const [progressWidth, setProgressWidth] = useState(100)
  const promoDurationRef = useRef<number | null>(null)

  useEffect(() => {
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
    return () => clearInterval(interval)
  }, [promotion.valid_until])

  const handleCopyCode = () => {
    if (!promotion.promo_code) return
    hapticFeedback('medium')
    navigator.clipboard.writeText(promotion.promo_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    hapticFeedback('medium')
    if (navigator.share) {
      navigator.share({
        title: promotion.title,
        text: promotion.description,
        url: window.location.href,
      })
    }
  }

  const getUrgency = () => {
    if (isExpired) return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-500', dot: 'bg-neutral-400', border: 'border-neutral-200 dark:border-neutral-700' }
    const diff = new Date(promotion.valid_until).getTime() - Date.now()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 7) return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800' }
    if (days > 3) return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-800' }
    return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', border: 'border-red-200 dark:border-red-800' }
  }

  const urgency = getUrgency()

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
    <div
      className="group relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 transition-all duration-300 hover:-translate-y-1 animate-slide-up"
      style={{
        animationDelay: `${delay}s`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0,139,127,0.15), 0 0 0 1px rgba(0,139,127,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)')}
    >

      {/* ── IMAGE pleine largeur ratio 4:5 ── */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        <img
          src={promotion.image_url || '/images/promotions/default.jpg'}
          alt={promotion.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {promotion.discount_value > 0 && (
          <div className="absolute top-3 right-3">
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

        <div className="absolute top-3 left-3">
          {promotion.is_active && !isExpired ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-white">En cours</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
              <span className="text-sm font-semibold text-white/80">Expirée</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-base font-bold text-white font-sans leading-tight line-clamp-2 drop-shadow-sm">
            {promotion.title}
          </h3>
          {promotion.description && (
            <p className="text-sm text-white/80 font-sans line-clamp-1 mt-0.5 drop-shadow-sm">
              {promotion.description}
            </p>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressWidth}%` }} />
        </div>
      </div>

      {/* ── CONTENU sous l'image ── */}
      <div className="p-4 space-y-3">

        {/* Countdown + date */}
        {!isExpired && promotion.is_active ? (
          <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${urgency.bg} ${urgency.border}`}>
            <div className="flex items-center gap-1.5">
              {[
                { value: timeLeft.days, label: 'J' },
                { value: timeLeft.hours, label: 'H' },
                { value: timeLeft.minutes, label: 'M' },
                { value: timeLeft.seconds, label: 'S' },
              ].map((unit, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="flex flex-col items-center">
                    <div className="bg-white dark:bg-neutral-800 rounded px-2 py-0.5 min-w-[2rem] text-center shadow-sm">
                      <span className={`text-base font-bold tabular-nums font-sans ${urgency.text}`}>
                        {unit.value}
                      </span>
                    </div>
                    <span className={`text-xs mt-0.5 font-sans ${urgency.text} opacity-60`}>{unit.label}</span>
                  </div>
                  {i < 3 && <span className={`text-base font-bold mb-3 opacity-30 ${urgency.text}`}>:</span>}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className={`w-4 h-4 ${urgency.text} opacity-70`} strokeWidth={1.5} />
              <span className={`text-sm font-medium font-sans ${urgency.text}`}>
                {new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
            <span className="text-base text-neutral-400 font-sans">Cette offre a expiré</span>
          </div>
        )}

        {/* Zones */}
        {promotion.zones && promotion.zones.length > 0 && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <div className="flex flex-wrap gap-1">
              {promotion.zones.slice(0, 3).map((zone, i) => (
                <span key={i} className="text-sm px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-sans">
                  {zone}
                </span>
              ))}
              {promotion.zones.length > 3 && (
                <span className="text-sm px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded-full font-sans">
                  +{promotion.zones.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Conditions */}
        {promotion.conditions && promotion.conditions.length > 0 && (
          <div className="space-y-1.5">
            {promotion.conditions.slice(0, 3).map((condition, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">{condition}</span>
              </div>
            ))}
          </div>
        )}

        {/* Code promo */}
        {promotion.promo_code && promotion.is_active && !isExpired && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-neutral-400 uppercase tracking-wider font-sans">Code promo</span>
              </div>
              <button onClick={handleShare} className="flex items-center gap-1 text-sm text-primary font-sans hover:opacity-70 transition-opacity">
                <Share className="w-4 h-4" strokeWidth={1.5} />
                Partager
              </button>
            </div>
            <button
              onClick={handleCopyCode}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-200 group/btn"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                  <Tag className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-lg font-bold text-primary font-mono tracking-wide">{promotion.promo_code}</span>
              </div>
              <span className={`text-sm font-semibold font-sans transition-colors ${copied ? 'text-emerald-600' : 'text-primary/70'}`}>
                {copied ? '✓ Copié' : 'Copier'}
              </span>
            </button>
          </div>
        )}

        {/* Section validité + conditions */}
        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
          <div className="p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 font-sans">Validité</span>
            </div>
            <div className="space-y-1.5">
              {(promotion as any).valid_from && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400 font-sans">Début</span>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 font-sans">
                    {formatDate((promotion as any).valid_from)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400 font-sans">Fin</span>
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 font-sans">
                  {formatDate(promotion.valid_until)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}