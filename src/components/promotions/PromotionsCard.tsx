'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { Promotion } from '@/types/promotion'
import { ArrowRight, MapPin, Globe, Clock, AlertTriangle, CheckCircle, Star } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionCardProps {
  promotion: Promotion
  delay?:    number
  featured?: boolean
}

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  delay    = 0,
  featured = false,
}) => {
  const router   = useRouter()
  const pathname = usePathname()
  const locale   = pathname.split('/')[1]

  const [isExpired, setIsExpired] = useState(false)
  const [daysLeft, setDaysLeft]   = useState(0)

  useEffect(() => {
    const diff = new Date(promotion.valid_until).getTime() - Date.now()
    if (diff <= 0) { setIsExpired(true); setDaysLeft(0) }
    else setDaysLeft(Math.floor(diff / 86400000))
  }, [promotion.valid_until])

  const getUrgency = () => {
    if (isExpired)     return { text: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800', icon: Clock,         label: 'Expirée' }
    if (daysLeft > 7)  return { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle, label: `${daysLeft}j restants` }
    if (daysLeft > 3)  return { text: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20',     icon: Clock,       label: `Plus que ${daysLeft}j` }
    return               { text: 'text-red-700 dark:text-red-400',               bg: 'bg-red-50 dark:bg-red-900/20',         icon: AlertTriangle, label: 'Expire bientôt !' }
  }

  const urgency     = getUrgency()
  const UrgencyIcon = urgency.icon
  const promo       = promotion as any
  const allZones    = !promotion.zones || promotion.zones.length === 0

  const handleClick = () => {
    hapticFeedback('light')
    router.push(`/${locale}/promotions/${promotion.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-white dark:bg-dark-surface border transition-all duration-300 hover:-translate-y-1 animate-slide-up cursor-pointer rounded-2xl overflow-hidden h-full flex flex-col ${
        featured ? 'border-primary/30' : 'border-neutral-200 dark:border-neutral-800'
      } ${isExpired ? 'opacity-60' : ''}`}
      style={{
        animationDelay: `${delay}s`,
        boxShadow: featured
          ? '0 6px 24px -4px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.12)'
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 32px -6px rgba(0,139,127,0.18), 0 0 0 1px rgba(0,139,127,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = featured
        ? '0 6px 24px -4px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.12)'
        : '0 1px 4px rgba(0,0,0,0.06)')}
    >
      {/* ── IMAGE ─────────────────────────────────────────────────────────── */}
      {/* Technique blurred-bg :                                              */}
      {/*  1. Image floutée en absolute (background, remplit le container)    */}
      {/*  2. Image réelle en object-contain (entière, non tronquée)          */}
      {/* → image toujours entière ET container toujours plein                */}
      <div className="relative w-full aspect-[4/3] overflow-hidden flex-shrink-0">

        {promotion.image_url ? (
          <>
            {/* Couche 1 — background flouté, remplit tout l'espace */}
            <img
              src={promotion.image_url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-60 saturate-150 pointer-events-none select-none"
            />
            {/* Couche 2 — image principale, entière, non tronquée */}
            <img
              src={promotion.image_url}
              alt={promotion.title}
              className="relative w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <span className="text-4xl font-black text-primary/20 font-sans">%</span>
          </div>
        )}

        {/* Gradient bas — lisibilité titre */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Badge remise */}
        {promotion.discount_value > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md" />
              <div className="relative bg-primary text-white rounded-xl px-2.5 py-1 shadow-lg">
                <span className="text-sm font-black font-sans leading-none">
                  {promotion.discount_type === 'percentage'
                    ? `-${promotion.discount_value}%`
                    : `-${promotion.discount_value} Ar`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Badge Promo du moment */}
        {featured && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold text-neutral-800">Promo du moment</span>
          </div>
        )}

        {/* Badge statut */}
        {!featured && (
          <div className="absolute top-3 right-3 z-10">
            {promotion.is_active && !isExpired ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-white">En cours</span>
              </div>
            ) : (
              <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                <span className="text-[10px] font-semibold text-white/80">Expirée</span>
              </div>
            )}
          </div>
        )}

        {/* Titre sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className={`font-bold text-white font-sans leading-tight drop-shadow-sm line-clamp-2 ${featured ? 'text-base' : 'text-sm'}`}>
            {promotion.title}
          </h3>
          {promo.subtitle && (
            <p className="text-[11px] text-white/80 font-sans line-clamp-1 drop-shadow-sm mt-0.5">{promo.subtitle}</p>
          )}
        </div>
      </div>

      {/* ── INFOS ── */}
      <div className="flex-1 flex flex-col p-3 gap-2.5">

        {/* Urgence + date */}
        <div className="flex items-center justify-between gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${urgency.bg} ${urgency.text}`}>
            <UrgencyIcon className="w-3 h-3" strokeWidth={1.5} />
            {urgency.label}
          </div>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans truncate">
            jusqu'au {fmtDate(promotion.valid_until)}
          </span>
        </div>

        {/* Zones */}
        <div className="flex items-center gap-1.5">
          {allZones ? (
            <>
              <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[10px] text-primary font-sans font-medium">Toutes zones Madagascar</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans line-clamp-1">
                {promotion.zones!.slice(0, 3).join(' · ')}
                {promotion.zones!.length > 3 && ` +${promotion.zones!.length - 3}`}
              </span>
            </>
          )}
        </div>

        {/* CTA — toujours ancré en bas grâce à mt-auto */}
        <button
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white rounded-full font-semibold text-sm transition-all duration-200 shadow-sm shadow-primary/20 group/btn"
          onClick={e => { e.stopPropagation(); handleClick() }}
        >
          Voir l'offre
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}