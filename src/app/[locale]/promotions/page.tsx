'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PromotionCard } from '@/components/promotions/PromotionsCard'
import { PromotionPopup } from '@/components/promotions/PromotionPopup'
import { usePromotionPopup } from '@/lib/hooks/usePromotionPopup'
import { Sparkles, Building2, Settings, Bell } from 'lucide-react'
import Link from 'next/link'
import type { Promotion } from '@/types/promotion'

const API_URL    = 'https://vito-backend-supabase.onrender.com/api/v1'
const IP_API_URL = 'https://ip-api.com/json/'

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = ({ featured = false }: { featured?: boolean }) => (
  <div className={`bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-pulse`}>
    <div className={`w-full bg-neutral-200 dark:bg-neutral-700 ${featured ? 'aspect-video' : 'aspect-[4/5]'}`} />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
      <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
      <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
    </div>
  </div>
)

export default function PromotionsPage() {
  const { showPopup, selectedPromotion, popupSettings, initializePopup, closePopup } = usePromotionPopup()
  const router   = useRouter()
  const pathname = usePathname()
  const locale   = pathname.split('/')[1]

  const isEntreprise  = pathname.includes('/entreprise')
  const isGrandPublic = !isEntreprise

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchPromotions() }, [])

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/promotions`)
      if (!res.ok) return
      const data: Promotion[] = await res.json()

      let userCity: string | null = null
      try {
        const saved = localStorage.getItem('user-location')
        if (saved && !['Localisation non disponible', 'Géolocalisation non supportée', 'Localisation indisponible'].includes(saved)) {
          userCity = saved.split(',')[0].trim()
        } else {
          const geo = await fetch(IP_API_URL)
          if (geo.ok) { const g = await geo.json(); if (g.status === 'success') userCity = g.city }
        }
      } catch {}

      let filtered = data
      if (userCity) {
        const local = data.filter(p => {
          const zones: string[] = (p as any).zones ?? []
          if (zones.length === 0) return true // toutes zones = visible partout
          return zones.some(z =>
            z.toLowerCase().includes(userCity!.toLowerCase()) ||
            userCity!.toLowerCase().includes(z.toLowerCase())
          )
        })
        if (local.length > 0) filtered = local
      }

      setPromotions(filtered)
      initializePopup(filtered, 'promotions')
    } catch (err) {
      console.error('Erreur chargement promotions:', err)
    } finally {
      setLoading(false)
    }
  }

  const active   = promotions.filter(p => p.is_active && new Date(p.valid_until) > new Date())
  const featured = active.find(p => p.is_featured) || null
  const others   = active.filter(p => !p.is_featured)
  const expired  = promotions.filter(p => !p.is_active || new Date(p.valid_until) <= new Date())

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pb-20 md:pb-8">

      {showPopup && selectedPromotion && (
        <PromotionPopup
          promotion={selectedPromotion}
          onClose={closePopup}
          autoCloseSec={popupSettings.auto_close_seconds}
        />
      )}

      {/* ── HERO HEADER — cohérent avec l'app ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-white to-neutral-50 dark:from-primary/15 dark:via-dark-surface dark:to-dark-bg border-b border-neutral-200/60 dark:border-neutral-800 pt-[64px] sm:pt-[70px]">

        {/* Fond décoratif */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-primary/5 dark:bg-primary/8 blur-2xl" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 max-w-7xl pt-8 pb-0">

          {/* Titre + compteur + alertes */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-sans tracking-tight leading-tight">
                  Promotions & Offres
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans mt-1">
                  {loading
                    ? 'Chargement...'
                    : active.length > 0
                      ? `${active.length} offre${active.length > 1 ? 's' : ''} en cours · Valables près de chez vous`
                      : 'Aucune offre active pour le moment'
                  }
                </p>
              </div>
            </div>

            {/* Bouton alertes */}
            <Link
              href={`/${locale}/parametres`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-dark-surface border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium hover:border-primary/40 hover:text-primary transition-all duration-200 shadow-sm flex-shrink-0"
            >
              <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Mes alertes</span>
            </Link>
          </div>

          {/* Onglets Grand Public / Entreprise */}
          <div className="flex gap-0 -mb-px">
            <button
              onClick={() => router.push(`/${locale}/promotions`)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 rounded-t-xl ${
                isGrandPublic
                  ? 'border-primary text-primary bg-white dark:bg-dark-surface shadow-sm'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Grand Public
            </button>
            <button
              onClick={() => router.push(`/${locale}/promotions/entreprise`)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 rounded-t-xl ${
                isEntreprise
                  ? 'border-primary text-primary bg-white dark:bg-dark-surface shadow-sm'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" strokeWidth={1.5} />
              Entreprise
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8">

        {loading ? (
          <div className="space-y-8">
            <SkeletonCard featured />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : active.length === 0 && expired.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-10 h-10 text-neutral-300" strokeWidth={1} />
            </div>
            <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
              Aucune promotion disponible
            </h2>
            <p className="text-neutral-400 dark:text-neutral-500 font-sans text-sm">
              Revenez bientôt pour découvrir nos prochaines offres
            </p>
            <Link href={`/${locale}/parametres`}
              className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              Activer les alertes promotions
            </Link>
          </div>
        ) : (
          <div className="space-y-10">

            {/* Promo du moment — bannière featured */}
            {featured && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                    Promo du moment
                  </span>
                </div>
                <PromotionCard promotion={featured} featured delay={0} />
              </div>
            )}

            {/* Offres en cours */}
            {others.length > 0 && (
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {featured && (
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                      Toutes les offres en cours
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {others.map((promo, i) => (
                    <PromotionCard key={promo.id} promotion={promo} delay={i * 0.05} />
                  ))}
                </div>
              </div>
            )}

            {/* Offres expirées */}
            {expired.length > 0 && (
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Offres expirées
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 opacity-50">
                  {expired.map((promo, i) => (
                    <PromotionCard key={promo.id} promotion={promo} delay={i * 0.05} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}