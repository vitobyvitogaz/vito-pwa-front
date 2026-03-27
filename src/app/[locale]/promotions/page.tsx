'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PromotionCard } from '@/components/promotions/PromotionsCard'
import { PromotionPopup } from '@/components/promotions/PromotionPopup'
import { usePromotionPopup } from '@/lib/hooks/usePromotionPopup'
import { Sparkles, Building2, Settings } from 'lucide-react'
import Link from 'next/link'
import type { Promotion } from '@/types/promotion'

const API_URL    = 'https://vito-backend-supabase.onrender.com/api/v1'
const IP_API_URL = 'https://ip-api.com/json/'

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = ({ featured = false }: { featured?: boolean }) => (
  <div className={`bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-pulse ${
    featured ? 'md:col-span-2' : ''
  }`}>
    <div className={`w-full bg-neutral-200 dark:bg-neutral-700 ${featured ? 'aspect-video' : 'aspect-[4/5]'}`} />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
      <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
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

  const [promotions, setPromotions]   = useState<Promotion[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/promotions`)
      if (!response.ok) return
      const data: Promotion[] = await response.json()

      // ── Géolocalisation ───────────────────────────────────────────────────
      let userCity: string | null = null
      try {
        const savedLocation = localStorage.getItem('user-location')
        if (savedLocation && !['Localisation non disponible', 'Géolocalisation non supportée', 'Localisation indisponible'].includes(savedLocation)) {
          userCity = savedLocation.split(',')[0].trim()
        } else {
          const geoRes = await fetch(IP_API_URL)
          if (geoRes.ok) {
            const geo = await geoRes.json()
            if (geo.status === 'success' && geo.city) userCity = geo.city
          }
        }
      } catch {}

      // ── Filtrer par zone si ville détectée ────────────────────────────────
      let filtered = data
      if (userCity) {
        const local = data.filter((p: Promotion) => {
          const zones: string[] = p.zones ?? []
          return zones.some((z) =>
            z.toLowerCase().includes(userCity!.toLowerCase()) ||
            userCity!.toLowerCase().includes(z.toLowerCase())
          )
        })
        if (local.length > 0) filtered = local
      }

      setPromotions(filtered)
      // Popup — page promotions autorisée selon config
      initializePopup(filtered, 'promotions')
    } catch (err) {
      console.error('Erreur chargement promotions:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Séparer featured et autres ────────────────────────────────────────────
  const active    = promotions.filter(p => p.is_active && new Date(p.valid_until) > new Date())
  const featured  = active.find(p => p.is_featured) || null
  const others    = active.filter(p => !p.is_featured)
  const expired   = promotions.filter(p => !p.is_active || new Date(p.valid_until) <= new Date())

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-[64px] sm:pt-[70px] pb-20 md:pb-8">

      {showPopup && selectedPromotion && (
        <PromotionPopup
          promotion={selectedPromotion}
          onClose={closePopup}
          autoCloseSec={popupSettings.auto_close_seconds}
        />
      )}

      {/* ── HEADER COMPACT ── */}
      <div className="bg-white dark:bg-dark-surface border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

          {/* Titre compact + lien Paramètres */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900 dark:text-white font-sans tracking-tight">
                  Promotions & Offres
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                  {active.length > 0 ? `${active.length} offre${active.length > 1 ? 's' : ''} en cours` : 'Aucune offre active'}
                </p>
              </div>
            </div>
            {/* Lien Paramètres — remplace le NotificationToggle ── */}
            <Link
              href={`/${locale}/parametres`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
              Gérer mes alertes
            </Link>
          </div>

          {/* Onglets Grand Public / Entreprise */}
          <div className="flex gap-1 pb-0">
            <button
              onClick={() => router.push(`/${locale}/promotions`)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ${
                isGrandPublic
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Grand Public
            </button>
            <button
              onClick={() => router.push(`/${locale}/promotions/entreprise`)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ${
                isEntreprise
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" strokeWidth={1.5} />
              Entreprise
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-6">

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <SkeletonCard featured />
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : active.length === 0 && expired.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-neutral-300" strokeWidth={1} />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 font-sans">Aucune promotion disponible pour le moment</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── Bannière Featured — Promo du moment ── */}
            {featured && (
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-primary fill-primary" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  Promo du moment
                </p>
                <PromotionCard promotion={featured} featured delay={0} />
              </div>
            )}

            {/* ── Offres en cours ── */}
            {others.length > 0 && (
              <div>
                {featured && (
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-3">
                    Autres offres en cours
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {others.map((promo, i) => (
                    <PromotionCard key={promo.id} promotion={promo} delay={i * 0.05} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Offres expirées — affichées en grisé ── */}
            {expired.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                  Offres expirées
                </p>
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