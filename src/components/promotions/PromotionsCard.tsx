'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Promotion } from '@/types/promotion'
import { Tag, Check, CalendarDays, Share, MapPin, Zap, Clock, AlertTriangle, CheckCircle, Store } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionCardProps {
  promotion: Promotion
  delay?:    number
  featured?: boolean
}

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  delay   = 0,
  featured = false,
}) => {
  const [timeLeft, setTimeLeft]     = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const [isExpired, setIsExpired]   = useState(false)
  const [copied, setCopied]         = useState(false)
  const [progressWidth, setProgressWidth] = useState(100)
  const promoDurationRef = useRef<number | null>(null)

  const end     = new Date(promotion.valid_until).getTime()
  const diffNow = end - Date.now()
  // ── Countdown tick uniquement si < 48h restants — performance ────────────
  const showLiveCountdown = !isExpired && diffNow > 0 && diffNow < 48 * 60 * 60 * 1000

  useEffect(() => {
    if (promoDurationRef.current === null) {
      const created = (promotion as any).created_at
        ? new Date((promotion as any).created_at).getTime()
        : Date.now() - 30 * 24 * 60 * 60 * 1000
      promoDurationRef.current = end - created
    }

    const calculateTimeLeft = () => {
      const now  = Date.now()
      const diff = end - now
      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' })
        setProgressWidth(0)
        return
      }
      setProgressWidth(Math.min(100, Math.max(0, (diff / promoDurationRef.current!) * 100)))
      setTimeLeft({
        days:    String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours:   String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        minutes: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        seconds: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0'),
      })
    }

    calculateTimeLeft()
    // ── Tick seulement si countdown live actif ────────────────────────────
    if (!showLiveCountdown) return
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [promotion.valid_until, showLiveCountdown])

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!promotion.promo_code) return
    hapticFeedback('medium')
    navigator.clipboard.writeText(promotion.promo_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    hapticFeedback('medium')
    if (navigator.share) {
      navigator.share({
        title: promotion.title,
        text:  promotion.description,
        url:   window.location.href,
      })
    }
  }

  const getUrgency = () => {
    if (isExpired) return {
      bg: 'bg-neutral-100 dark:bg-neutral-800',
      text: 'text-neutral-500',
      border: 'border-neutral-200 dark:border-neutral-700',
      label: 'Expirée',
      icon: Clock,
    }
    const diff = new Date(promotion.valid_until).getTime() - Date.now()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 7) return {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      label: `${days}j restants`,
      icon: CheckCircle,
    }
    if (days > 3) return {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      label: `Plus que ${days}j !`,
      icon: Clock,
    }
    return {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      label: 'Expire bientôt !',
      icon: AlertTriangle,
    }
  }

  const urgency     = getUrgency()
  const UrgencyIcon = urgency.icon

  const daysLeft = Math.max(0, Math.floor((end - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div
      onClick={() => hapticFeedback('light')}
      className={`group relative bg-white dark:bg-dark-surface overflow-hidden border transition-all duration-300 hover:-translate-y-1 animate-slide-up cursor-pointer ${
        featured
          ? 'rounded-2xl border-primary/30 shadow-lg shadow-primary/10'
          : 'rounded-2xl border-neutral-200 dark:border-neutral-800'
      }`}
      style={{
        animationDelay: `${delay}s`,
        boxShadow: featured
          ? '0 8px 32px -8px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.15)'
          : '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0,139,127,0.15), 0 0 0 1px rgba(0,139,127,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = featured
        ? '0 8px 32px -8px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.15)'
        : '0 1px 3px rgba(0,0,0,0.05)')}
    >
      {/* IMAGE */}
      <div className={`relative w-full overflow-hidden ${featured ? 'aspect-video' : 'aspect-[4/5]'}`}>
        {promotion.image_url ? (
          <Image
            src={promotion.image_url}
            alt={promotion.title}
            fill quality={72} loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Tag className="w-12 h-12 text-primary/30" strokeWidth={1} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Badge featured */}
        {featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-semibold shadow-lg">
            <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            Promo du moment
          </div>
        )}

        {/* Badge remise */}
        {promotion.discount_value > 0 && (
          <div className={`absolute top-3 ${featured ? 'right-3' : 'right-3'}`}>
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

        {/* Badges statut + urgence */}
        {!featured && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {promotion.is_active && !isExpired ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-white">En cours</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                <span className="text-xs font-semibold text-white/80">Expirée</span>
              </div>
            )}
            {!isExpired && promotion.is_active && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-sm ${urgency.bg} ${urgency.border}`}>
                <UrgencyIcon className={`w-3 h-3 ${urgency.text}`} strokeWidth={2} />
                <span className={`text-xs font-semibold ${urgency.text}`}>{urgency.label}</span>
              </div>
            )}
          </div>
        )}

        {/* Titre sur image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className={`font-bold text-white font-sans leading-tight line-clamp-2 drop-shadow-sm mb-1 ${featured ? 'text-2xl' : 'text-lg'}`}>
            {promotion.title}
          </h3>
          {promotion.description && (
            <p className="text-sm text-white/75 font-sans line-clamp-1 drop-shadow-sm">
              {promotion.description}
            </p>
          )}
        </div>

        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressWidth}%` }} />
        </div>
      </div>

      {/* CONTENU */}
      <div className="p-4 space-y-4">

        {/* Countdown — live seulement si < 48h, sinon affichage statique */}
        {!isExpired && promotion.is_active ? (
          showLiveCountdown ? (
            <div className={`rounded-full px-4 py-3 border ${urgency.bg} ${urgency.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {[
                    { value: timeLeft.days,    label: 'J' },
                    { value: timeLeft.hours,   label: 'H' },
                    { value: timeLeft.minutes, label: 'M' },
                    { value: timeLeft.seconds, label: 'S' },
                  ].map((unit, i) => (
                    <div key={i} className="flex items-baseline gap-0.5">
                      <span className={`text-base font-bold tabular-nums font-sans ${urgency.text}`}>{unit.value}</span>
                      <span className={`text-[10px] font-medium font-sans ${urgency.text} opacity-60`}>{unit.label}</span>
                      {i < 3 && <span className={`text-xs font-bold mx-0.5 ${urgency.text} opacity-40`}>:</span>}
                    </div>
                  ))}
                </div>
                <div className={`flex items-center gap-1.5 pl-3 border-l ${urgency.border}`}>
                  <CalendarDays className={`w-3.5 h-3.5 ${urgency.text} opacity-70`} strokeWidth={1.5} />
                  <span className={`text-xs font-semibold font-sans ${urgency.text}`}>
                    {new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Affichage statique si > 48h restants
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-full border ${urgency.bg} ${urgency.border}`}>
              <div className="flex items-center gap-1.5">
                <UrgencyIcon className={`w-4 h-4 ${urgency.text}`} strokeWidth={1.5} />
                <span className={`text-sm font-semibold font-sans ${urgency.text}`}>
                  {daysLeft > 0 ? `${daysLeft} jours restants` : 'Expire aujourd\'hui'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-neutral-500 font-sans">
                  {new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
            <CalendarDays className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-neutral-400 font-sans">Offre expirée le</p>
              <p className="text-sm font-semibold text-neutral-500 font-sans">
                {new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}

        {/* Zones */}
        {promotion.zones && promotion.zones.length > 0 && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="flex flex-wrap gap-1.5">
              {promotion.zones.slice(0, 3).map((zone, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-sans font-medium">
                  {zone}
                </span>
              ))}
              {promotion.zones.length > 3 && (
                <span className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded-full font-sans">
                  +{promotion.zones.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Conditions */}
        {promotion.conditions && promotion.conditions.length > 0 && (
          <div className="space-y-2">
            {promotion.conditions.slice(0, 2).map((condition, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-snug">{condition}</span>
              </div>
            ))}
            {promotion.conditions.length > 2 && (
              <p className="text-xs text-neutral-400 font-sans pl-6">
                +{promotion.conditions.length - 2} condition{promotion.conditions.length - 2 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Code promo — libellé "à montrer au revendeur" */}
        {promotion.promo_code && promotion.is_active && !isExpired && (
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-dashed border-primary/20">
              <div className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                <span className="text-xs font-medium text-primary/80 font-sans">
                  À montrer à votre revendeur
                </span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-xs text-primary font-sans hover:opacity-70 transition-opacity"
              >
                <Share className="w-3.5 h-3.5" strokeWidth={1.5} />
                Partager
              </button>
            </div>
            <button
              onClick={handleCopyCode}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-all duration-200 group/btn"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                  <Tag className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-xl font-black text-primary font-mono tracking-widest">
                  {promotion.promo_code}
                </span>
              </div>
              <span className={`text-sm font-semibold font-sans transition-colors px-3 py-1.5 rounded-full ${
                copied
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-primary/10 text-primary'
              }`}>
                {copied ? '✓ Copié' : 'Copier'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}