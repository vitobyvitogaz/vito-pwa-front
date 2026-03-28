'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PromotionCard } from '@/components/promotions/PromotionsCard'
import { PromotionPopup } from '@/components/promotions/PromotionPopup'
import { usePromotionPopup } from '@/lib/hooks/usePromotionPopup'
import { Sparkles, Building2 } from 'lucide-react'
import type { Promotion } from '@/types/promotion'

const API_URL    = 'https://vito-backend-supabase.onrender.com/api/v1'
const IP_API_URL = 'https://ip-api.com/json/'

const SkeletonCard = () => (
  <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-pulse flex flex-row h-32">
    <div className="w-28 sm:w-32 bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
    <div className="flex-1 p-3 space-y-2">
      <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
      <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
      <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-2" />
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

  // Toutes les promos actives dans un même tableau — featured en tête
  const active  = promotions
    .filter(p => p.is_active && new Date(p.valid_until) > new Date())
    .sort((a, b) => {
      // featured en premier
      if ((a as any).is_featured && !(b as any).is_featured) return -1
      if (!(a as any).is_featured && (b as any).is_featured) return 1
      return 0
    })
  const expired = promotions.filter(p => !p.is_active || new Date(p.valid_until) <= new Date())

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
          <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1">
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
            // Skeleton — même grille 3 colonnes
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
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
            </div>
          ) : (
            <div className="space-y-8">

              {/* Offres en cours — grille unifiée, featured en tête via sort() */}
              {active.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {active.map((promo, i) => (
                    <PromotionCard
                      key={promo.id}
                      promotion={promo}
                      featured={(promo as any).is_featured}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
              )}

              {/* Offres expirées */}
              {expired.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
                    Offres expirées
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                    {expired.map((promo, i) => (
                      <PromotionCard key={promo.id} promotion={promo} delay={i * 0.04} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}