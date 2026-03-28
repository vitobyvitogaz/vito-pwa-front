'use client'

import { useState, useEffect, useRef } from 'react'
import type { Promotion } from '@/types/promotion'
import {
  Tag, Check, CalendarDays, MapPin, Globe,
  Clock, AlertTriangle, CheckCircle, Store, Layers, Share,
} from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionCardProps {
  promotion: Promotion
  delay?:    number
  featured?: boolean
}

// Masquer les UUIDs bruts — ne jamais les afficher à l'utilisateur
const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  delay    = 0,
  featured = false,
}) => {
  const [timeLeft, setTimeLeft]           = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const [isExpired, setIsExpired]         = useState(false)
  const [copied, setCopied]               = useState(false)
  const [progressWidth, setProgressWidth] = useState(100)
  const promoDurationRef                  = useRef<number | null>(null)

  const end        = new Date(promotion.valid_until).getTime()
  const diffNow    = end - Date.now()
  // Tick live uniquement si < 48h — gain de performance
  const showLiveCd = !isExpired && diffNow > 0 && diffNow < 48 * 60 * 60 * 1000

  useEffect(() => {
    if (promoDurationRef.current === null) {
      const created = (promotion as any).created_at
        ? new Date((promotion as any).created_at).getTime()
        : Date.now() - 30 * 24 * 60 * 60 * 1000
      promoDurationRef.current = end - created
    }
    const calc = () => {
      const diff = end - Date.now()
      if (diff <= 0) {
        setIsExpired(true)
        setProgressWidth(0)
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' })
        return
      }
      setProgressWidth(Math.min(100, Math.max(0, (diff / promoDurationRef.current!) * 100)))
      setTimeLeft({
        days:    String(Math.floor(diff / 86400000)).padStart(2, '0'),
        hours:   String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      })
    }
    calc()
    if (!showLiveCd) return
    const iv = setInterval(calc, 1000)
    return () => clearInterval(iv)
  }, [promotion.valid_until, showLiveCd])

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
    if (navigator.share) navigator.share({
      title: promotion.title,
      text:  promotion.description,
      url:   window.location.href,
    })
  }

  const getUrgency = () => {
    if (isExpired) return {
      bg: 'bg-neutral-100 dark:bg-neutral-800',
      text: 'text-neutral-500 dark:text-neutral-400',
      border: 'border-neutral-200 dark:border-neutral-700',
      icon: Clock,
    }
    const days = Math.floor((end - Date.now()) / 86400000)
    if (days > 7) return {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle,
    }
    if (days > 3) return {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      icon: Clock,
    }
    return {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: AlertTriangle,
    }
  }

  const urgency      = getUrgency()
  const UrgencyIcon  = urgency.icon
  const daysLeft     = Math.max(0, Math.floor((end - Date.now()) / 86400000))

  // Zones
  const allZones = !promotion.zones || promotion.zones.length === 0

  // Produits : ne jamais afficher les UUIDs
  const productNames = ((promotion as any).applicable_products || [])
    .filter((p: string) => p && !isUUID(p))

  // Période formatée
  const promo       = promotion as any
  const validFrom   = promo.valid_from
    ? new Date(promo.valid_from).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : null
  const validUntil  = new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div
      onClick={() => hapticFeedback('light')}
      className={`group relative bg-white dark:bg-dark-surface overflow-hidden border transition-all duration-300 hover:-translate-y-1 animate-slide-up cursor-pointer rounded-2xl flex flex-col ${
        featured ? 'border-primary/30' : 'border-neutral-200 dark:border-neutral-800'
      }`}
      style={{
        animationDelay: `${delay}s`,
        boxShadow: featured
          ? '0 6px 20px -4px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.12)'
          : '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,139,127,0.14), 0 0 0 1px rgba(0,139,127,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = featured
        ? '0 6px 20px -4px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.12)'
        : '0 1px 3px rgba(0,0,0,0.06)')}
    >

      {/* ── IMAGE ─────────────────────────────────────────────────────────── */}
      {/* max-h-32 limite la hauteur → cards compactes → 4 par ligne possible */}
      {/* h-auto respecte le ratio naturel → pas de tronquage                */}
      <div className="relative w-full overflow-hidden rounded-t-2xl bg-neutral-100 dark:bg-neutral-800">
        {promotion.image_url ? (
          <img
            src={promotion.image_url}
            alt={promotion.title}
            className="w-full h-auto max-h-32 object-contain block transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-24 flex items-center justify-center">
            <Tag className="w-7 h-7 text-primary/20" strokeWidth={1} />
          </div>
        )}

        {/* Badge remise — en haut à droite */}
        {promotion.discount_value > 0 && (
          <div className="absolute top-2 right-2 bg-primary text-white rounded-lg px-2 py-0.5 shadow-sm">
            <span className="text-xs font-bold font-sans leading-none">
              {promotion.discount_type === 'percentage'
                ? `-${promotion.discount_value}%`
                : `-${promotion.discount_value} Ar`}
            </span>
          </div>
        )}

        {/* Badge Promo du moment (featured) OU badge statut (normal) */}
        <div className="absolute top-2 left-2">
          {featured ? (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-primary text-white rounded-full text-[10px] font-semibold shadow-sm">
              <svg className="w-2.5 h-2.5 fill-white flex-shrink-0" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Promo du moment
            </div>
          ) : promotion.is_active && !isExpired ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-semibold text-white leading-none">En cours</span>
            </div>
          ) : (
            <div className="px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
              <span className="text-[9px] font-semibold text-white/80 leading-none">Expirée</span>
            </div>
          )}
        </div>

        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressWidth}%` }} />
        </div>
      </div>

      {/* ── INFOS ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col p-3 gap-2">

        {/* 1. Titre + sous-titre + description */}
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-sans leading-snug line-clamp-2">
            {promotion.title}
          </h3>
          {promo.subtitle && (
            <p className="text-[11px] font-semibold text-primary dark:text-primary/80 font-sans line-clamp-1 mt-0.5">
              {promo.subtitle}
            </p>
          )}
          {promotion.description && (
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans line-clamp-2 leading-relaxed mt-0.5">
              {promotion.description}
            </p>
          )}
        </div>

        {/* Séparateur */}
        <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

        {/* 2. Countdown */}
        {!isExpired && promotion.is_active ? (
          showLiveCd ? (
            // Live < 48h
            <div className={`rounded-full px-2.5 py-1.5 border ${urgency.bg} ${urgency.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {[
                    { v: timeLeft.days, l: 'J' },
                    { v: timeLeft.hours, l: 'H' },
                    { v: timeLeft.minutes, l: 'M' },
                    { v: timeLeft.seconds, l: 'S' },
                  ].map((u, i) => (
                    <div key={i} className="flex items-baseline gap-0.5">
                      <span className={`text-xs font-bold tabular-nums font-sans ${urgency.text}`}>{u.v}</span>
                      <span className={`text-[8px] font-medium ${urgency.text} opacity-60`}>{u.l}</span>
                      {i < 3 && <span className={`text-[9px] font-bold mx-0.5 ${urgency.text} opacity-30`}>:</span>}
                    </div>
                  ))}
                </div>
                <div className={`flex items-center gap-0.5 pl-2 border-l ${urgency.border}`}>
                  <CalendarDays className={`w-2.5 h-2.5 ${urgency.text} opacity-70`} strokeWidth={1.5} />
                  <span className={`text-[9px] font-semibold font-sans ${urgency.text}`}>
                    {validUntil}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Statique > 48h
            <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-full border ${urgency.bg} ${urgency.border}`}>
              <div className="flex items-center gap-1">
                <UrgencyIcon className={`w-3 h-3 ${urgency.text}`} strokeWidth={1.5} />
                <span className={`text-[11px] font-semibold font-sans ${urgency.text}`}>
                  {daysLeft > 0 ? `${daysLeft} jours restants` : "Expire aujourd'hui"}
                </span>
              </div>
              <span className={`text-[9px] font-medium ${urgency.text} opacity-70`}>{validUntil}</span>
            </div>
          )
        ) : (
          // Expirée
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
            <CalendarDays className="w-3 h-3 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[10px] text-neutral-400 font-sans">Expirée le {validUntil}</span>
          </div>
        )}

        {/* 3. Période complète (du ... au ...) */}
        {validFrom && !isExpired && (
          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-sans text-center -mt-1">
            Du {validFrom} au {validUntil}
          </p>
        )}

        {/* 4. Métadonnées groupées */}
        <div className="space-y-1">

          {/* Zones */}
          <div className="flex items-center gap-1 flex-wrap">
            {allZones ? (
              <>
                <Globe className="w-3 h-3 text-primary flex-shrink-0" strokeWidth={1.5} />
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-sans font-medium">
                  Toutes zones
                </span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
                {promotion.zones!.slice(0, 2).map((z, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-sans">
                    {z}
                  </span>
                ))}
                {promotion.zones!.length > 2 && (
                  <span className="text-[10px] text-neutral-400 font-sans">+{promotion.zones!.length - 2}</span>
                )}
              </>
            )}
          </div>

          {/* Catégorie produit */}
          {promo.product_category && (
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full font-sans capitalize">
                {promo.product_category}
              </span>
            </div>
          )}

          {/* Produits applicables — noms lisibles uniquement */}
          {productNames.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="w-3 h-3 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
              {productNames.slice(0, 2).map((p: string, i: number) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-sans">
                  {p}
                </span>
              ))}
              {productNames.length > 2 && (
                <span className="text-[10px] text-neutral-400 font-sans">+{productNames.length - 2}</span>
              )}
            </div>
          )}
        </div>

        {/* 5. Conditions */}
        {promotion.conditions && promotion.conditions.length > 0 && (
          <div className="space-y-1">
            {promotion.conditions.slice(0, 2).map((c, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-1.5 h-1.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </div>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans leading-snug line-clamp-1">
                  {c}
                </span>
              </div>
            ))}
            {promotion.conditions.length > 2 && (
              <p className="text-[9px] text-neutral-400 pl-4.5 font-sans">
                +{promotion.conditions.length - 2} condition{promotion.conditions.length - 2 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* 6. Code avantage — ancré en bas */}
        {promotion.promo_code && promotion.is_active && !isExpired && (
          <div className="mt-auto pt-1">
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 overflow-hidden">
              <div className="flex items-center justify-between px-2.5 py-1 border-b border-dashed border-primary/20">
                <div className="flex items-center gap-1">
                  <Store className="w-2.5 h-2.5 text-primary" strokeWidth={1.5} />
                  <span className="text-[9px] font-medium text-primary/80 font-sans">À montrer au revendeur</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-0.5 text-[9px] text-primary font-sans hover:opacity-70 transition-opacity"
                >
                  <Share className="w-2.5 h-2.5" strokeWidth={1.5} />
                  Partager
                </button>
              </div>
              <button
                onClick={handleCopyCode}
                className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-primary/10 transition-all duration-200"
              >
                <span className="text-sm font-black text-primary font-mono tracking-widest">
                  {promotion.promo_code}
                </span>
                <span className={`text-[10px] font-semibold font-sans px-2 py-0.5 rounded-full transition-colors ${
                  copied
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {copied ? '✓' : 'Copier'}
                </span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}