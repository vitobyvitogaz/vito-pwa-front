'use client'

import { useState, useEffect, useRef } from 'react'
import type { Promotion } from '@/types/promotion'
import {
  Tag, Check, CalendarDays, MapPin, Globe,
  Clock, AlertTriangle, CheckCircle, Store, Layers, Share, Star,
} from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionCardProps {
  promotion: Promotion
  delay?:    number
  featured?: boolean
}

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

// ── fmtDate accepte Date | string pour éviter l'erreur TypeScript ─────────────
const fmtDate = (d: Date | string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(d).toLocaleDateString('fr-FR', opts ?? { day: 'numeric', month: 'short', year: 'numeric' })

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
        setIsExpired(true); setProgressWidth(0)
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
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    hapticFeedback('medium')
    if (navigator.share) navigator.share({ title: promotion.title, text: promotion.description, url: window.location.href })
  }

  const getUrgency = () => {
    if (isExpired) return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-500', border: 'border-neutral-200 dark:border-neutral-700', icon: Clock }
    const days = Math.floor((end - Date.now()) / 86400000)
    if (days > 7)  return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle }
    if (days > 3)  return { bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-700 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-800',     icon: Clock }
    return           { bg: 'bg-red-50 dark:bg-red-900/20',               text: 'text-red-700 dark:text-red-400',         border: 'border-red-200 dark:border-red-800',         icon: AlertTriangle }
  }

  const urgency     = getUrgency()
  const UrgencyIcon = urgency.icon
  const daysLeft    = Math.max(0, Math.floor((end - Date.now()) / 86400000))
  const allZones    = !promotion.zones || promotion.zones.length === 0
  const promo       = promotion as any

  const productNames = (promo.applicable_products || []).filter((p: string) => p && !isUUID(p))

  const validUntilFmt = fmtDate(promotion.valid_until)
  const validFromFmt  = promo.valid_from
    ? fmtDate(promo.valid_from, { day: 'numeric', month: 'short' })
    : null

  return (
    <div
      onClick={() => hapticFeedback('light')}
      className={`group relative bg-white dark:bg-dark-surface border transition-all duration-300 hover:-translate-y-0.5 animate-slide-up cursor-pointer rounded-2xl overflow-hidden flex flex-row ${
        featured
          ? 'border-primary/40 shadow-md shadow-primary/10'
          : 'border-neutral-200 dark:border-neutral-800'
      } ${isExpired ? 'opacity-60' : ''}`}
      style={{
        animationDelay: `${delay}s`,
        boxShadow: featured
          ? '0 4px 20px -4px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.15)'
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,139,127,0.15), 0 0 0 1px rgba(0,139,127,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = featured
        ? '0 4px 20px -4px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.15)'
        : '0 1px 4px rgba(0,0,0,0.06)')}
    >

      {/* ── COLONNE 1 : IMAGE ─────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0 w-28 sm:w-32 bg-neutral-100 dark:bg-neutral-800 self-stretch">
        {promotion.image_url ? (
          <img
            src={promotion.image_url}
            alt={promotion.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full min-h-[120px] flex items-center justify-center">
            <Tag className="w-8 h-8 text-primary/20" strokeWidth={1} />
          </div>
        )}

        {/* Barre de progression verticale */}
        <div className="absolute top-0 right-0 w-0.5 h-full bg-black/10">
          <div
            className="w-full bg-primary transition-all duration-1000 origin-top"
            style={{ height: `${progressWidth}%` }}
          />
        </div>

        {/* Badge remise */}
        {promotion.discount_value > 0 && (
          <div className="absolute top-2 left-0 bg-primary text-white pl-2 pr-2.5 py-0.5 rounded-r-full shadow-sm">
            <span className="text-xs font-black font-sans leading-none">
              {promotion.discount_type === 'percentage'
                ? `-${promotion.discount_value}%`
                : `-${promotion.discount_value} Ar`}
            </span>
          </div>
        )}

        {/* Badge featured */}
        {featured && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/90 backdrop-blur-sm text-white rounded-full text-[9px] font-semibold shadow-sm">
              <Star className="w-2.5 h-2.5 fill-white" />
              Promo du moment
            </div>
          </div>
        )}
      </div>

      {/* ── COLONNE 2 : INFORMATIONS ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col p-3 gap-2">

        {/* En-tête : titre + statut */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-sans leading-snug line-clamp-2">
              {promotion.title}
            </h3>
            {promo.subtitle && (
              <p className="text-[11px] font-semibold text-primary dark:text-primary/80 font-sans line-clamp-1 mt-0.5">
                {promo.subtitle}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            {promotion.is_active && !isExpired ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">En cours</span>
              </div>
            ) : (
              <div className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                <span className="text-[9px] font-semibold text-neutral-400">Expirée</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {promotion.description && (
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans line-clamp-2 leading-relaxed -mt-1">
            {promotion.description}
          </p>
        )}

        {/* Séparateur */}
        <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

        {/* Countdown */}
        {!isExpired && promotion.is_active ? (
          showLiveCd ? (
            <div className={`rounded-full px-2.5 py-1.5 border ${urgency.bg} ${urgency.border} flex items-center justify-between`}>
              <div className="flex items-center gap-1.5">
                {[{ v: timeLeft.days, l: 'J' }, { v: timeLeft.hours, l: 'H' }, { v: timeLeft.minutes, l: 'M' }, { v: timeLeft.seconds, l: 'S' }].map((u, i) => (
                  <div key={i} className="flex items-baseline gap-0.5">
                    <span className={`text-xs font-bold tabular-nums font-sans ${urgency.text}`}>{u.v}</span>
                    <span className={`text-[8px] ${urgency.text} opacity-60`}>{u.l}</span>
                    {i < 3 && <span className={`text-[9px] font-bold mx-0.5 ${urgency.text} opacity-30`}>:</span>}
                  </div>
                ))}
              </div>
              <div className={`flex items-center gap-0.5 pl-2 border-l ${urgency.border}`}>
                <CalendarDays className={`w-2.5 h-2.5 ${urgency.text} opacity-70`} strokeWidth={1.5} />
                <span className={`text-[9px] font-semibold font-sans ${urgency.text}`}>{validUntilFmt}</span>
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-full border ${urgency.bg} ${urgency.border}`}>
              <div className="flex items-center gap-1">
                <UrgencyIcon className={`w-3 h-3 ${urgency.text}`} strokeWidth={1.5} />
                <span className={`text-[11px] font-semibold font-sans ${urgency.text}`}>
                  {daysLeft > 0 ? `${daysLeft} jours restants` : "Expire aujourd'hui"}
                </span>
              </div>
              <span className={`text-[9px] font-medium ${urgency.text} opacity-70`}>{validUntilFmt}</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
            <CalendarDays className="w-3 h-3 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[10px] text-neutral-400 font-sans">Expirée le {validUntilFmt}</span>
          </div>
        )}

        {/* Période complète */}
        {validFromFmt && !isExpired && (
          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-sans -mt-1">
            Du {validFromFmt} au {validUntilFmt}
          </p>
        )}

        {/* Métadonnées */}
        <div className="space-y-1.5">

          {/* Toutes les zones — toutes affichées */}
          <div className="flex items-start gap-1 flex-wrap">
            {allZones ? (
              <>
                <Globe className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-sans font-medium">
                  Toutes zones Madagascar
                </span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="flex flex-wrap gap-1">
                  {promotion.zones!.map((z, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-sans">
                      {z}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Catégorie produit */}
          {promo.product_category && (
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-full font-sans capitalize">
                {promo.product_category}
              </span>
            </div>
          )}

          {/* Produits applicables — noms lisibles uniquement */}
          {productNames.length > 0 && (
            <div className="flex items-start gap-1 flex-wrap">
              <Tag className="w-3 h-3 text-neutral-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="flex flex-wrap gap-1">
                {productNames.map((p: string, i: number) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-sans">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conditions — toutes affichées */}
          {promotion.conditions && promotion.conditions.length > 0 && (
            <div className="space-y-1">
              {promotion.conditions.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-1.5 h-1.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                  </div>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans leading-snug">
                    {c}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Code avantage */}
        {promotion.promo_code && promotion.is_active && !isExpired && (
          <div className="mt-auto pt-1">
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 overflow-hidden">
              <div className="flex items-center justify-between px-2.5 py-1 border-b border-dashed border-primary/20">
                <div className="flex items-center gap-1">
                  <Store className="w-2.5 h-2.5 text-primary" strokeWidth={1.5} />
                  <span className="text-[9px] font-medium text-primary/80 font-sans">À montrer au revendeur</span>
                </div>
                <button onClick={handleShare} className="flex items-center gap-0.5 text-[9px] text-primary font-sans hover:opacity-70">
                  <Share className="w-2.5 h-2.5" strokeWidth={1.5} />
                  Partager
                </button>
              </div>
              <button onClick={handleCopyCode} className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-primary/10 transition-all duration-200">
                <span className="text-sm font-black text-primary font-mono tracking-widest">{promotion.promo_code}</span>
                <span className={`text-[10px] font-semibold font-sans px-2 py-0.5 rounded-full transition-colors ${
                  copied ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-primary/10 text-primary'
                }`}>
                  {copied ? '✓ Copié' : 'Copier'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}