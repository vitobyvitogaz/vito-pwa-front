'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Promotion } from '@/types/promotion'
import {
  ArrowLeft, Share2, MapPin, Globe, Clock, AlertTriangle, CheckCircle,
  CalendarDays, Tag, Store, Check, Layers, Package, ChevronRight,
} from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

const fmtDate = (d: Date | string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(d).toLocaleDateString('fr-FR', opts ?? { day: 'numeric', month: 'long', year: 'numeric' })

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg animate-pulse">
    <div className="w-full aspect-[3/2] bg-neutral-200 dark:bg-neutral-800" />
    <div className="container mx-auto px-4 max-w-2xl py-6 space-y-4">
      <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
      <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
      <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
    </div>
  </div>
)

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.12em]">
      {title}
    </p>
    {children}
  </div>
)

export default function PromotionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params.id as string
  const locale = (params.locale as string) || 'fr'

  const [promotion, setPromotion]   = useState<Promotion | null>(null)
  const [loading, setLoading]       = useState(true)
  const [notFound, setNotFound]     = useState(false)
  const [timeLeft, setTimeLeft]     = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const [isExpired, setIsExpired]   = useState(false)
  const [progressWidth, setProgressWidth] = useState(100)
  const [copied, setCopied]         = useState(false)
  const [imgLoaded, setImgLoaded]   = useState(false)
  const promoDurationRef            = useRef<number | null>(null)

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await fetch(`${API_URL}/promotions/${id}`)
        if (!res.ok) { setNotFound(true); return }
        const data = await res.json()
        setPromotion(data)
      } catch { setNotFound(true) }
      finally { setLoading(false) }
    }
    fetchPromotion()
  }, [id])

  useEffect(() => {
    if (!promotion) return
    const end = new Date(promotion.valid_until).getTime()

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
    const iv = setInterval(calc, 1000)
    return () => clearInterval(iv)
  }, [promotion])

  const handleShare = async () => {
    hapticFeedback('medium')
    if (navigator.share) {
      await navigator.share({
        title: promotion?.title,
        text:  promotion?.description,
        url:   window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleCopyCode = () => {
    if (!promotion?.promo_code) return
    hapticFeedback('medium')
    navigator.clipboard.writeText(promotion.promo_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) return <Skeleton />

  if (notFound || !promotion) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-4">🔍</p>
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 font-sans">Promotion introuvable</h1>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 font-sans">Cette offre n'existe pas ou a été supprimée.</p>
      <button onClick={() => router.push(`/${locale}/promotions`)}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-semibold text-sm">
        <ArrowLeft className="w-4 h-4" />Voir toutes les offres
      </button>
    </div>
  )

  const promo        = promotion as any
  const end          = new Date(promotion.valid_until).getTime()
  const allZones     = !promotion.zones || promotion.zones.length === 0
  const productNames = (promo.applicable_products || []).filter((p: string) => p && !isUUID(p))
  const daysLeft     = Math.max(0, Math.floor((end - Date.now()) / 86400000))

  const getUrgency = () => {
    if (isExpired) return { text: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800', border: 'border-neutral-200 dark:border-neutral-700', icon: Clock }
    if (daysLeft > 7)  return { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle }
    if (daysLeft > 3)  return { text: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20',     border: 'border-amber-200 dark:border-amber-800',     icon: Clock }
    return               { text: 'text-red-700 dark:text-red-400',               bg: 'bg-red-50 dark:bg-red-900/20',         border: 'border-red-200 dark:border-red-800',         icon: AlertTriangle }
  }

  const urgency = getUrgency()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pb-24">

      {/* ── IMAGE HERO ── */}
      <div className="relative w-full bg-neutral-900 overflow-hidden" style={{ aspectRatio: '3/2', maxHeight: '60vh' }}>
        {promotion.image_url ? (
          <img
            src={promotion.image_url}
            alt={promotion.title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-8xl font-black text-primary/20 font-sans">%</span>
          </div>
        )}

        {/* Gradient overlay bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressWidth}%` }} />
        </div>

        {/* Bouton retour */}
        <button
          onClick={() => { hapticFeedback('light'); router.back() }}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
        </button>

        {/* Bouton partager */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <Share2 className="w-4 h-4 text-white" strokeWidth={2} />
        </button>

        {/* Badge remise */}
        {promotion.discount_value > 0 && (
          <div className="absolute top-16 left-4">
            <div className="bg-primary text-white rounded-2xl px-4 py-2 shadow-xl">
              <span className="text-2xl font-black font-sans leading-none">
                {promotion.discount_type === 'percentage'
                  ? `-${promotion.discount_value}%`
                  : `-${promotion.discount_value} Ar`}
              </span>
            </div>
          </div>
        )}

        {/* Titre sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans leading-tight drop-shadow-sm">
            {promotion.title}
          </h1>
          {promo.subtitle && (
            <p className="text-base text-white/80 font-sans mt-1 drop-shadow-sm">{promo.subtitle}</p>
          )}
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">

        {/* ── BLOC COUNTDOWN ── */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm -mt-4 relative z-10 p-4 border border-neutral-100 dark:border-neutral-800">
          {!isExpired ? (
            <div className="space-y-3">
              {/* Countdown */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${urgency.bg} ${urgency.border}`}>
                <div className="flex items-center gap-3">
                  {[
                    { v: timeLeft.days,    l: 'Jours' },
                    { v: timeLeft.hours,   l: 'Heures' },
                    { v: timeLeft.minutes, l: 'Min' },
                    { v: timeLeft.seconds, l: 'Sec' },
                  ].map((u, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className={`text-xl font-black tabular-nums font-sans ${urgency.text}`}>{u.v}</span>
                      <span className={`text-[9px] font-medium font-sans ${urgency.text} opacity-60`}>{u.l}</span>
                      {i < 3 && <span className="sr-only">:</span>}
                    </div>
                  ))}
                </div>
                <div className={`text-right pl-4 border-l ${urgency.border}`}>
                  <p className={`text-[10px] font-medium ${urgency.text} opacity-70`}>Expire le</p>
                  <p className={`text-xs font-bold ${urgency.text}`}>
                    {fmtDate(promotion.valid_until, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {/* Période */}
              {promo.valid_from && (
                <div className="flex items-center gap-2 px-1">
                  <CalendarDays className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                    Du {fmtDate(promo.valid_from, { day: 'numeric', month: 'long' })} au {fmtDate(promotion.valid_until, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Clock className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 font-sans">Offre expirée</p>
                <p className="text-xs text-neutral-400 font-sans">Le {fmtDate(promotion.valid_until)}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── SECTIONS ── */}
        <div className="mt-6 space-y-6">

          {/* Description */}
          {promotion.description && (
            <Section title="À propos de cette offre">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed">
                {promotion.description}
              </p>
            </Section>
          )}

          {/* Zones */}
          <Section title="Zones concernées">
            {allZones ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-primary/8 dark:bg-primary/15 rounded-xl">
                <Globe className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} />
                <p className="text-sm font-medium text-primary font-sans">Disponible dans toutes les zones de Madagascar</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {promotion.zones!.map((z, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-700 rounded-full shadow-sm">
                    <MapPin className="w-3 h-3 text-primary" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-sans">{z}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Catégorie + produits */}
          {(promo.product_category || productNames.length > 0) && (
            <Section title="Produits concernés">
              <div className="space-y-2">
                {promo.product_category && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-700 rounded-xl">
                    <Layers className="w-4 h-4 text-neutral-500 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-neutral-400 font-sans">Catégorie</p>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 font-sans capitalize">{promo.product_category}</p>
                    </div>
                  </div>
                )}
                {productNames.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {productNames.map((p: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 dark:bg-primary/15 rounded-full">
                        <Package className="w-3 h-3 text-primary" strokeWidth={1.5} />
                        <span className="text-xs font-medium text-primary font-sans">{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Conditions */}
          {promotion.conditions && promotion.conditions.length > 0 && (
            <Section title="Conditions">
              <div className="bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                {promotion.conditions.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-sans leading-snug">{c}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Code avantage */}
          {promotion.promo_code && !isExpired && (
            <Section title="Code avantage">
              <div className="bg-white dark:bg-dark-surface border-2 border-dashed border-primary/30 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-dashed border-primary/20 bg-primary/5 dark:bg-primary/10 flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <p className="text-xs font-medium text-primary/80 font-sans">Présentez ce code à votre revendeur</p>
                </div>
                <div className="px-4 py-4 flex items-center justify-between">
                  <span className="text-3xl font-black text-primary font-mono tracking-[0.2em]">
                    {promotion.promo_code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                      copied
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 active:scale-95'
                    }`}
                  >
                    {copied ? <><Check className="w-4 h-4" />Copié !</> : 'Copier'}
                  </button>
                </div>
              </div>
            </Section>
          )}

        </div>
      </div>

      {/* ── BARRE CTA FIXE EN BAS ── */}
      {!isExpired && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 safe-area-bottom">
          <div className="container mx-auto max-w-2xl flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans truncate">
                {promotion.discount_value > 0 && (
                  <span className="font-bold text-primary mr-1">
                    {promotion.discount_type === 'percentage' ? `-${promotion.discount_value}%` : `-${promotion.discount_value} Ar`}
                  </span>
                )}
                {promotion.title}
              </p>
              <p className="text-[10px] text-neutral-400 font-sans">
                Expire le {fmtDate(promotion.valid_until, { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => { hapticFeedback('medium'); router.push(`/${locale}/revendeurs`) }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white rounded-full font-semibold text-sm transition-all duration-200 shadow-lg shadow-primary/25 flex-shrink-0"
            >
              Trouver un revendeur
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}