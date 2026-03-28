'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Promotion } from '@/types/promotion'
import {
  Tag, Check, CalendarDays, Share, MapPin, Globe,
  Clock, AlertTriangle, CheckCircle, Store, Package, Layers,
} from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionCardProps {
  promotion: Promotion
  delay?:    number
  featured?: boolean
}

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

  const end     = new Date(promotion.valid_until).getTime()
  const diffNow = end - Date.now()
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
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' })
        setProgressWidth(0)
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
    if (navigator.share) navigator.share({ title: promotion.title, text: promotion.description, url: window.location.href })
  }

  const getUrgency = () => {
    if (isExpired) return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-500', border: 'border-neutral-200 dark:border-neutral-700', label: 'Expirée', icon: Clock }
    const days = Math.floor((end - Date.now()) / 86400000)
    if (days > 7)  return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', label: `${days}j restants`, icon: CheckCircle }
    if (days > 3)  return { bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-800',   label: `Plus que ${days}j !`, icon: Clock }
    return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', label: 'Expire bientôt !', icon: AlertTriangle }
  }

  const urgency     = getUrgency()
  const UrgencyIcon = urgency.icon
  const daysLeft    = Math.max(0, Math.floor((end - Date.now()) / 86400000))
  const allZones    = !promotion.zones || promotion.zones.length === 0

  return (
    <div
      onClick={() => hapticFeedback('light')}
      className={`group relative bg-white dark:bg-dark-surface overflow-hidden border transition-all duration-300 hover:-translate-y-1 animate-slide-up cursor-pointer rounded-2xl ${
        featured ? 'border-primary/30' : 'border-neutral-200 dark:border-neutral-800'
      }`}
      style={{
        animationDelay: `${delay}s`,
        boxShadow: featured
          ? '0 8px 32px -8px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.15)'
          : '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(0,139,127,0.15), 0 0 0 1px rgba(0,139,127,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = featured
        ? '0 8px 32px -8px rgba(0,139,127,0.2), 0 0 0 1px rgba(0,139,127,0.15)'
        : '0 1px 3px rgba(0,0,0,0.05)')}
    >

      {/* ── IMAGE ── */}
      {/* aspect-[3/2] sur les cards normales = plus compact et plusieurs par ligne */}
      {/* aspect-video sur la featured = plus large et impactante */}
      <div className={`relative w-full overflow-hidden ${featured ? 'aspect-video' : 'aspect-[3/2]'}`}>
        {promotion.image_url ? (
          <Image
            src={promotion.image_url}
            alt={promotion.title}
            fill
            unoptimized
            quality={72}
            loading="lazy"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-103"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Tag className="w-10 h-10 text-primary/30" strokeWidth={1} />
          </div>
        )}

        {/* Gradient bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Badge Promo du moment */}
        {featured && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 bg-primary text-white rounded-full text-xs font-semibold shadow-md">
            <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Promo du moment
          </div>
        )}

        {/* Badge remise */}
        {promotion.discount_value > 0 && (
          <div className="absolute top-2.5 right-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-lg blur-sm" />
              <div className="relative bg-primary text-white rounded-lg px-2.5 py-1 shadow-md">
                <span className="text-sm font-bold font-sans leading-none">
                  {promotion.discount_type === 'percentage' ? `-${promotion.discount_value}%` : `-${promotion.discount_value} Ar`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Badges statut + urgence (non featured) */}
        {!featured && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {promotion.is_active && !isExpired ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-white">En cours</span>
              </div>
            ) : (
              <div className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                <span className="text-[10px] font-semibold text-white/80">Expirée</span>
              </div>
            )}
          </div>
        )}

        {/* Titre + sous-titre sur image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className={`font-bold text-white font-sans leading-tight drop-shadow-sm line-clamp-2 ${featured ? 'text-xl mb-0.5' : 'text-sm mb-0'}`}>
            {promotion.title}
          </h3>
          {featured && (promotion as any).subtitle && (
            <p className="text-xs text-white/85 font-sans line-clamp-1 drop-shadow-sm">
              {(promotion as any).subtitle}
            </p>
          )}
        </div>

        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressWidth}%` }} />
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="p-3 space-y-2.5">

        {/* Countdown */}
        {!isExpired && promotion.is_active ? (
          showLiveCd ? (
            <div className={`rounded-full px-3 py-2 border ${urgency.bg} ${urgency.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[{ v: timeLeft.days, l: 'J' }, { v: timeLeft.hours, l: 'H' }, { v: timeLeft.minutes, l: 'M' }, { v: timeLeft.seconds, l: 'S' }].map((u, i) => (
                    <div key={i} className="flex items-baseline gap-0.5">
                      <span className={`text-sm font-bold tabular-nums font-sans ${urgency.text}`}>{u.v}</span>
                      <span className={`text-[9px] font-medium font-sans ${urgency.text} opacity-60`}>{u.l}</span>
                      {i < 3 && <span className={`text-[10px] font-bold mx-0.5 ${urgency.text} opacity-40`}>:</span>}
                    </div>
                  ))}
                </div>
                <div className={`flex items-center gap-1 pl-2 border-l ${urgency.border}`}>
                  <CalendarDays className={`w-3 h-3 ${urgency.text} opacity-70`} strokeWidth={1.5} />
                  <span className={`text-[10px] font-semibold font-sans ${urgency.text}`}>
                    {new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-between px-3 py-2 rounded-full border ${urgency.bg} ${urgency.border}`}>
              <div className="flex items-center gap-1.5">
                <UrgencyIcon className={`w-3.5 h-3.5 ${urgency.text}`} strokeWidth={1.5} />
                <span className={`text-xs font-semibold font-sans ${urgency.text}`}>
                  {daysLeft > 0 ? `${daysLeft} jours restants` : "Expire aujourd'hui"}
                </span>
              </div>
              <span className={`text-[10px] font-medium font-sans ${urgency.text} opacity-70`}>
                {new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
            <CalendarDays className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-neutral-500 font-sans">
              Expirée le {new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        )}

        {/* Zones */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {allZones ? (
            <>
              <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={1.5} />
              <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-sans font-medium">
                Toutes zones Madagascar
              </span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
              {promotion.zones!.slice(0, 2).map((z, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-sans">
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
        {(promotion as any).product_category && (
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-sans capitalize">
              {(promotion as any).product_category}
            </span>
          </div>
        )}

        {/* Produits applicables */}
        {(promotion as any).applicable_products?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Package className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            {(promotion as any).applicable_products.slice(0, 2).map((p: string, i: number) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-primary/8 dark:bg-primary/15 text-primary rounded-full font-sans">
                {p}
              </span>
            ))}
            {(promotion as any).applicable_products.length > 2 && (
              <span className="text-[10px] text-neutral-400 font-sans">+{(promotion as any).applicable_products.length - 2}</span>
            )}
          </div>
        )}

        {/* Conditions */}
        {promotion.conditions && promotion.conditions.length > 0 && (
          <div className="space-y-1">
            {promotion.conditions.slice(0, 2).map((c, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2 h-2 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </div>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-snug line-clamp-1">{c}</span>
              </div>
            ))}
            {promotion.conditions.length > 2 && (
              <p className="text-[10px] text-neutral-400 font-sans pl-5">+{promotion.conditions.length - 2} condition{promotion.conditions.length - 2 > 1 ? 's' : ''}</p>
            )}
          </div>
        )}

        {/* Code avantage */}
        {promotion.promo_code && promotion.is_active && !isExpired && (
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-dashed border-primary/20">
              <div className="flex items-center gap-1">
                <Store className="w-3 h-3 text-primary" strokeWidth={1.5} />
                <span className="text-[10px] font-medium text-primary/80 font-sans">À montrer au revendeur</span>
              </div>
              <button onClick={handleShare} className="text-[10px] text-primary font-sans hover:opacity-70">
                Partager
              </button>
            </div>
            <button onClick={handleCopyCode} className="w-full flex items-center justify-between px-3 py-2 hover:bg-primary/10 transition-all duration-200">
              <span className="text-base font-black text-primary font-mono tracking-widest">{promotion.promo_code}</span>
              <span className={`text-xs font-semibold font-sans px-2.5 py-1 rounded-full ${
                copied ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-primary/10 text-primary'
              }`}>
                {copied ? '✓' : 'Copier'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}