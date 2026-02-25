'use client'

import { useState, useEffect, useRef } from 'react'
import type { Promotion } from '@/types/promotion'
import { Clock, Tag, Check, ChevronDown, CalendarDays, Share, Zap, MapPin } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionCardProps {
  promotion: Promotion
  delay?: number
}

export const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, delay = 0 }) => {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const [isExpired, setIsExpired] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
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

  const handleToggleExpand = () => {
    hapticFeedback('light')
    setIsExpanded(!isExpanded)
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

  const getUrgencyColor = () => {
    if (isExpired) return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-500', dot: 'bg-neutral-400' }
    const diff = new Date(promotion.valid_until).getTime() - Date.now()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 7) return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' }
    if (days > 3) return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' }
    return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' }
  }

  const urgency = getUrgencyColor()

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div
      className="group relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 transition-all duration-300 hover:-translate-y-1 animate-slide-up"
      style={{
        animationDelay: `${delay}s`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(0,139,127,0.12), 0 0 0 1px rgba(0,139,127,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)')}
    >
      {/* ── IMAGE object-contain sur fond blanc ── */}
      <div className="relative w-full bg-white" style={{ height: '220px' }}>
        <img
          src={promotion.image_url || '/images/promotions/default.jpg'}
          alt={promotion.title}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badge discount */}
        {promotion.discount_value > 0 && (
          <div className="absolute top-3 right-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 rounded-xl blur-md" />
              <div className="relative bg-primary text-white rounded-xl px-3.5 py-2 shadow-lg">
                <span className="text-lg font-bold font-sans leading-none">
                  {promotion.discount_type === 'percentage'
                    ? `-${promotion.discount_value}%`
                    : `-${promotion.discount_value} Ar`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Badge expirée */}
        {!promotion.is_active && (
          <div className="absolute top-3 left-3">
            <div className="bg-black/70 backdrop-blur-sm text-white rounded-xl px-3 py-1.5 text-xs font-semibold border border-white/10">
              Expirée
            </div>
          </div>
        )}

        {/* Barre de progression en bas de l'image */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className="h-full bg-primary transition-all duration-1000"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="p-5">

        {/* Titre + description */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-sans leading-tight mb-1.5 line-clamp-2">
            {promotion.title}
          </h3>
          {promotion.subtitle && (
            <p className="text-sm font-medium text-primary mb-1 font-sans">{promotion.subtitle}</p>
          )}
          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 font-sans leading-relaxed">
            {promotion.description}
          </p>
        </div>

        {/* ── COUNTDOWN ── */}
        {!isExpired && promotion.is_active ? (
          <div className={`rounded-2xl p-3.5 mb-4 ${urgency.bg}`}>
            <div className="flex items-center justify-between">
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
                      <div className="bg-white dark:bg-neutral-800 rounded-lg px-2 py-1 min-w-[1.9rem] text-center shadow-sm">
                        <span className={`text-sm font-bold tabular-nums font-sans ${urgency.text}`}>
                          {unit.value}
                        </span>
                      </div>
                      <span className={`text-[9px] mt-0.5 font-sans ${urgency.text} opacity-70`}>
                        {unit.label}
                      </span>
                    </div>
                    {i < 3 && (
                      <span className={`font-bold text-sm mb-3 ${urgency.text} opacity-50`}>:</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Indicateur urgence */}
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${urgency.dot} animate-pulse`} />
                <span className={`text-xs font-semibold font-sans ${urgency.text}`}>
                  En cours
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-3.5 mb-4 bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-sm text-neutral-400 font-sans">Cette offre a expiré</span>
          </div>
        )}

        {/* Date validité */}
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-xs text-neutral-400 font-sans">
            Valide jusqu'au {new Date(promotion.valid_until).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </span>
        </div>

        {/* Zones */}
        {promotion.zones && promotion.zones.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
            <div className="flex flex-wrap gap-1.5">
              {promotion.zones.map((zone, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-sans"
                >
                  {zone}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── CODE PROMO ── */}
        {promotion.promo_code && promotion.is_active && !isExpired && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-sans">
                Code promotionnel
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-600 transition-colors font-sans"
              >
                <Share className="w-3.5 h-3.5" strokeWidth={1.5} />
                Partager
              </button>
            </div>
            <button
              onClick={handleCopyCode}
              className="w-full group/btn relative overflow-hidden flex items-center justify-between px-4 py-3 bg-primary/5 hover:bg-primary/10 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              <div className="relative flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                  <Tag className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-base font-bold text-primary font-mono tracking-wide">
                  {promotion.promo_code}
                </span>
              </div>
              <span className={`relative text-xs font-semibold font-sans transition-colors ${copied ? 'text-emerald-600' : 'text-primary'}`}>
                {copied ? '✓ Copié' : 'Copier'}
              </span>
            </button>
          </div>
        )}

        {/* ── BOUTON DÉTAILS ── */}
        <button
          onClick={handleToggleExpand}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-all duration-200 group/expand"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold text-neutral-800 dark:text-white font-sans">
              Voir les détails
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* ── DÉTAILS EXPANDÉS ── */}
      <div className={`overflow-hidden transition-all duration-400 ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 px-5 py-5 space-y-3">

          {/* Validité */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <CalendarDays className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <h5 className="text-sm font-bold text-neutral-900 dark:text-white font-sans">Validité</h5>
                <p className="text-xs text-neutral-400 font-sans">Période d'application</p>
              </div>
            </div>
            <div className="space-y-2">
              {(promotion as any).valid_from && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-50 dark:border-neutral-800">
                  <span className="text-xs text-neutral-400 font-sans">Début</span>
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-sans">
                    {formatDate((promotion as any).valid_from)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-neutral-400 font-sans">Fin</span>
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-sans">
                  {formatDate(promotion.valid_until)}
                </span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          {promotion.conditions && promotion.conditions.length > 0 && (
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-neutral-900 dark:text-white font-sans">Conditions</h5>
                  <p className="text-xs text-neutral-400 font-sans">Règles d'application</p>
                </div>
              </div>
              <ul className="space-y-2">
                {promotion.conditions.map((condition, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                      {condition}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}