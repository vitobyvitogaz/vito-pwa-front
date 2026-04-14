'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import type { Promotion } from '@/types/promotion'
import { X, Sparkles, ArrowRight, Calendar } from 'lucide-react'
import { hapticFeedback } from '@/lib/utils/haptic'

interface PromotionPopupProps {
  promotion:    Promotion
  onClose:      () => void
  autoCloseSec?: number
}

export const PromotionPopup: React.FC<PromotionPopupProps> = ({
  promotion,
  onClose,
  autoCloseSec = 30,
}) => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [isVisible, setIsVisible]         = useState(true)
  const [isClosing, setIsClosing]         = useState(false)
  const [timeLeft, setTimeLeft]           = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const [isExpired, setIsExpired]         = useState(false)
  const [progressWidth, setProgressWidth] = useState(100)
  const promoDurationRef                  = useRef<number | null>(null)

  useEffect(() => {
    if (!isVisible) return
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
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' }); return
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
    const iv   = setInterval(calc, 1000)
    const auto = setTimeout(() => handleClose(), autoCloseSec * 1000)
    return () => { clearInterval(iv); clearTimeout(auto) }
  }, [promotion.valid_until, isVisible, autoCloseSec])

  const getUrgency = () => {
    if (isExpired) return { text: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800' }
    const days = Math.floor((new Date(promotion.valid_until).getTime() - Date.now()) / 86400000)
    if (days > 7) return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
    if (days > 3) return { text: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20' }
    return          { text: 'text-red-600 dark:text-red-400',               bg: 'bg-red-50 dark:bg-red-900/20' }
  }
  const urgency = getUrgency()

  const handleClose = () => {
    hapticFeedback('light')
    setIsClosing(true)
    setTimeout(() => { setIsVisible(false); onClose() }, 300)
  }

  const handleCTA = () => {
    hapticFeedback('medium')
    setIsClosing(true)
    setTimeout(() => { setIsVisible(false); onClose(); router.push(`/${locale}/promotions`) }, 300)
  }

  if (!isVisible) return null

  const discountLabel = promotion.discount_value > 0
    ? promotion.discount_type === 'percentage'
      ? `-${promotion.discount_value}%`
      : `-${promotion.discount_value} Ar`
    : null

  const countdownUnits = [
    { value: timeLeft.days,    label: 'Jours' },
    { value: timeLeft.hours,   label: 'Heures' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes fadeScale {
          from { transform: scale(0.96); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
      `}</style>

      {/* ── MOBILE : portrait compact ────────────────────────────────────── */}
      <div
        className={`sm:hidden relative w-full max-w-[320px] transition-all duration-300 ${isClosing ? 'scale-95 opacity-0 translate-y-4' : ''}`}
        style={{ animation: isClosing ? 'none' : 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative w-full aspect-[4/5] overflow-hidden">
            {promotion.image_url ? (
              <Image src={promotion.image_url} alt={promotion.title} fill quality={72} priority
                className="object-cover" sizes="320px" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary/30" strokeWidth={1} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <button onClick={handleClose}
              className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-200 hover:rotate-90 active:scale-90">
              <X className="w-5 h-5 text-white" strokeWidth={2} />
            </button>
            {discountLabel && (
              <div className="absolute top-3 left-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/40 rounded-xl blur-sm" />
                  <div className="relative bg-primary text-white rounded-xl px-3 py-1.5 shadow-lg">
                    <span className="text-base font-bold font-sans">{discountLabel}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute top-3 right-16">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/20">
                <span className="pulse-dot w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-xs font-semibold text-white">En cours</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-lg font-bold text-white font-sans leading-tight line-clamp-2 drop-shadow-sm mb-1">{promotion.title}</h2>
              {promotion.description && (
                <p className="text-sm text-white/75 font-sans line-clamp-1">{promotion.description}</p>
              )}
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000 rounded-full" style={{ width: `${progressWidth}%` }} />
              </div>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            {!isExpired ? (
              <div className={`rounded-xl p-3 ${urgency.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-4 gap-1.5">
                    {countdownUnits.map((u, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className={`text-base font-bold tabular-nums font-sans ${urgency.text}`}>{u.value}</span>
                        <span className={`text-[10px] mt-0.5 font-medium font-sans ${urgency.text} opacity-60`}>{u.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 pl-3 border-l border-neutral-200 dark:border-neutral-700">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-400 font-sans">
                      {new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <span className="text-xs text-red-600 dark:text-red-400 font-sans">Cette offre a expiré</span>
              </div>
            )}
            {!isExpired && (
              <button onClick={handleCTA}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 font-sans group active:scale-95">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                Voir toutes les promos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP : 2 colonnes ─────────────────────────────────────────── */}
      <div
        className={`hidden sm:flex relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : ''}`}
        style={{ animation: isClosing ? 'none' : 'fadeScale 0.25s ease-out', maxHeight: '88vh' }}
      >
        {/* Colonne gauche — hauteur = colonne droite, largeur auto selon ratio image */}
        {/* Colonne gauche — hauteur = colonne droite, largeur auto selon ratio image */}
        <div className="relative self-stretch flex-shrink-0 overflow-hidden">
          {promotion.image_url ? (
            <img
              src={promotion.image_url}
              alt={promotion.title}
              style={{ height: '100%', width: 'auto', display: 'block', maxWidth: '400px' }}
            />
          ) : (
            <div className="w-48 h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-primary/30" strokeWidth={1} />
            </div>
          )}

          {/* Badges — positionnés dans la colonne gauche uniquement */}
          <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
            {discountLabel && (
              <div className="bg-primary text-white rounded-full px-5 py-2 shadow-xl">
                <span className="text-xl font-black font-sans">{discountLabel}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/20 w-fit">
              <span className="pulse-dot w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-xs font-semibold text-white">En cours</span>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressWidth}%` }} />
          </div>
        </div>

        {/* Colonne droite — Contenu */}
        <div className="flex-1 bg-white dark:bg-dark-surface flex flex-col overflow-y-auto">

          {/* Header */}
          <div className="flex items-start justify-between p-7 pb-4">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider font-sans">Offre spéciale</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-sans leading-tight">
                {promotion.title}
              </h2>
              {(promotion as any).subtitle && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans mt-1.5">{(promotion as any).subtitle}</p>
              )}
            </div>
            <button onClick={handleClose}
              className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-all duration-200 hover:rotate-90 active:scale-90 flex-shrink-0">
              <X className="w-4 h-4 text-neutral-600 dark:text-neutral-300" strokeWidth={2} />
            </button>
          </div>

          {promotion.description && (
            <div className="px-7 pb-5">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                {promotion.description}
              </p>
            </div>
          )}

          <div className="mx-7 border-t border-neutral-100 dark:border-neutral-800" />

          {/* Countdown */}
          <div className="px-7 py-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 font-sans">
              {isExpired ? 'Offre expirée' : 'Expire dans'}
            </p>
            {!isExpired ? (
              <div className={`rounded-2xl p-4 ${urgency.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    {countdownUnits.map((u, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className={`text-2xl font-black tabular-nums font-sans ${urgency.text}`}>{u.value}</span>
                        <span className={`text-[10px] mt-0.5 font-medium font-sans ${urgency.text} opacity-60`}>{u.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pl-5 border-l border-neutral-200 dark:border-neutral-700">
                    <Calendar className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] text-neutral-400 font-sans">Expire le</p>
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">
                        {new Date(promotion.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                <span className="text-sm text-red-600 dark:text-red-400 font-sans">Cette offre a expiré</span>
              </div>
            )}
          </div>

          {/* Conditions */}
          {(promotion as any).conditions?.length > 0 && (
            <div className="px-7 pb-5">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 font-sans">Conditions</p>
              <ul className="space-y-1.5">
                {(promotion as any).conditions.slice(0, 3).map((c: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="px-7 pb-7 mt-auto pt-4">
            {!isExpired && (
              <button onClick={handleCTA}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 font-sans group active:scale-95">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                Voir toutes les promotions
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
            )}
            <p onClick={handleClose}
              className="text-center text-xs text-neutral-400 font-sans mt-3 cursor-pointer hover:text-neutral-600 transition-colors">
              Fermer
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}