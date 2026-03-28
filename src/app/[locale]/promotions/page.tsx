'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PromotionCard } from '@/components/promotions/PromotionsCard'
import { PromotionPopup } from '@/components/promotions/PromotionPopup'
import { usePromotionPopup } from '@/lib/hooks/usePromotionPopup'
import { Sparkles, Building2, Bell } from 'lucide-react'
import Link from 'next/link'
import type { Promotion } from '@/types/promotion'

const API_URL    = 'https://vito-backend-supabase.onrender.com/api/v1'
const IP_API_URL = 'https://ip-api.com/json/'

const SkeletonCard = () => (
  <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-pulse">
    <div className="w-full aspect-[3/2] bg-neutral-200 dark:bg-neutral-700" />
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
          if (zones.length === 0) return true
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
    <div className="min-h-screen bg-gradient-to-b from-neutral-25 via-white to-neutral-25 dark:from-dark-bg dark:via-dark-surface/95 dark:to-dark-bg pt-16 pb-20">

      {showPopup && selectedPromotion && (
        <PromotionPopup
          promotion={selectedPromotion}
          onClose={closePopup}
          autoCloseSec={popupSettings.auto_close_seconds}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

        {/* ── HEADER — structure identique à la page Produits ── */}
        <div className="text-center mb-10 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight font-sans">
            Promotions & Offres
          </h1>

          <div className="max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed tracking-wide font-sans">
              Des offres adaptées à chaque profil, particuliers comme professionnels
            </p>
            <div className="h-px w-24 mx-auto mt-6 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />
          </div>
        </div>

        {/* ── Onglets Grand Public / Entreprise ── */}
        <div className="flex justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 gap-0">
            <button
              onClick={() => router.push(`/${locale}/promotions`)}
              className={`flex items-center gap-2 px-6 py-3 rounded-l-full text-sm font-semibold transition-all duration-300 ${
                isGrandPublic
                  ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-200 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Promos Grand Public
            </button>
            <button
              onClick={() => router.push(`/${locale}/promotions/entreprise`)}
              className={`flex items-center gap-2 px-6 py-3 rounded-r-full text-sm font-semibold transition-all duration-300 ${
                isEntreprise
                  ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-200 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" strokeWidth={1.5} />
              Offres Entreprise
            </button>
          </div>
        </div>

        {/* ── CONTENU ── */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : active.length === 0 && expired.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-10 h-10 text-neutral-300" strokeWidth={1} />
              </div>
              <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2 font-sans">
                Aucune promotion disponible
              </h2>
              <p className="text-neutral-400 dark:text-neutral-500 font-sans text-sm mb-6">
                Revenez bientôt pour découvrir nos prochaines offres
              </p>
              <Link href={`/${locale}/parametres`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                <Bell className="w-4 h-4" strokeWidth={1.5} />
                Activer les alertes promotions
              </Link>
            </div>
          ) : (
            <div className="space-y-10">

              {/* Promo du moment — bannière featured pleine largeur */}
              {featured && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    Promo du moment
                  </p>
                  {/* Featured : card large sur desktop */}
                  <div className="max-w-2xl">
                    <PromotionCard promotion={featured} featured delay={0} />
                  </div>
                </div>
              )}

              {/* Offres en cours — grille multi-colonnes */}
              {others.length > 0 && (
                <div>
                  {featured && (
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-4">
                      Autres offres en cours
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {others.map((promo, i) => (
                      <PromotionCard key={promo.id} promotion={promo} delay={i * 0.05} />
                    ))}
                  </div>
                </div>
              )}

              {/* Offres expirées */}
              {expired.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
                    Offres expirées
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 opacity-50">
                    {expired.map((promo, i) => (
                      <PromotionCard key={promo.id} promotion={promo} delay={i * 0.05} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lien alertes — discret en bas */}
        <div className="text-center mt-10">
          <Link href={`/${locale}/parametres`}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary transition-colors font-sans">
            <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
            Gérer mes alertes promotions
          </Link>
        </div>

      </div>
    </div>
  )
}