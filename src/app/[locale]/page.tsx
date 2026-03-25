'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MainButtons } from '@/components/home/MainButtons'
import { QuickActions } from '@/components/home/QuickActions'
import { InstallPrompt } from '@/components/layout/InstallPrompt'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { PromotionPopup } from '@/components/promotions/PromotionPopup'
import { usePromotionPopup } from '@/lib/hooks/usePromotionPopup'
import { useHeroContent } from '@/lib/hooks/useAppSettings'
import { X, Info } from 'lucide-react'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

// ── Skeleton hero mobile ─────────────────────────────────────────────────────
const HeroSkeletonMobile = () => (
  <div className="relative block md:hidden w-full aspect-[4/5] bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 animate-pulse">
    {/* Simulation glassmorphism card */}
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white/10 rounded-2xl p-6 space-y-3">
        <div className="h-8 w-3/4 mx-auto bg-white/20 rounded-xl" />
        <div className="h-4 w-2/3 mx-auto bg-white/15 rounded-lg" />
        <div className="h-3 w-1/2 mx-auto bg-white/10 rounded-lg" />
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2" />
        <div className="flex justify-center gap-6 pt-2">
          <div className="flex flex-col items-center gap-1">
            <div className="h-5 w-8 bg-white/20 rounded" />
            <div className="h-2 w-12 bg-white/15 rounded" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-5 w-8 bg-white/20 rounded" />
            <div className="h-2 w-12 bg-white/15 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ── Skeleton hero desktop ────────────────────────────────────────────────────
const HeroSkeletonDesktop = () => (
  <div className="relative hidden md:block w-full aspect-video bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 animate-pulse">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4 bg-white/10 rounded-2xl p-10 space-y-4">
        <div className="h-12 w-2/3 mx-auto bg-white/20 rounded-xl" />
        <div className="h-6 w-1/2 mx-auto bg-white/15 rounded-lg" />
        <div className="h-4 w-3/4 mx-auto bg-white/10 rounded-lg" />
        <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mt-2" />
        <div className="flex justify-center gap-8 pt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-6 w-10 bg-white/20 rounded" />
              <div className="h-2 w-14 bg-white/15 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// ── Skeleton MainButtons — grille 2x2 aspect-square ─────────────────────────
const MainButtonsSkeleton = () => (
  <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-dark-surface rounded-xl p-5 aspect-square border border-neutral-100 dark:border-neutral-800 animate-pulse"
        style={{ animationDelay: `${i * 0.05}s` }}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Icône skeleton w-14 h-14 */}
          <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          {/* Texte skeleton */}
          <div className="space-y-3 p-3">
            <div className="h-5 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
            <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
            <div className="h-3 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
            <div className="flex items-center gap-2 pt-1">
              <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 rounded" />
              <div className="w-4 h-4 bg-neutral-100 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// ── Skeleton QuickActions — 4 lignes horizontales ────────────────────────────
const QuickActionsSkeleton = () => (
  <div className="max-w-7xl mx-auto">
    {/* Titre */}
    <div className="h-6 w-36 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-5 animate-pulse" />
    <div className="grid grid-cols-1 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-dark-surface rounded-xl p-5 border border-neutral-100 dark:border-neutral-800 animate-pulse"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-center gap-4">
            {/* Icône skeleton w-12 h-12 */}
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
              <div className="h-3 w-1/3 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
            </div>
            <div className="w-5 h-5 bg-neutral-100 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default function HomePage() {
  const { showPopup, selectedPromotion, initializePopup, closePopup } = usePromotionPopup()
  const { bannerUrlDesktop, bannerUrlMobile, title, subtitle, description, stats, loading: heroLoading } = useHeroContent()
  const [showGlassCard, setShowGlassCard] = useState(true)

  // ── State pour tracker si les composants principaux sont prêts ──────────
  const [contentReady, setContentReady] = useState(false)

  useEffect(() => {
    const fetchAndInitPopup = async () => {
      try {
        const response = await fetch(`${API_URL}/promotions`)
        if (!response.ok) return
        const promotions = await response.json()
        initializePopup(promotions)
      } catch (err) {
        console.error('Erreur popup promotions:', err)
      }
    }
    fetchAndInitPopup()
  }, [])

  // ── Marquer le contenu comme prêt dès que heroLoading est false ──────────
  useEffect(() => {
    if (!heroLoading) {
      // Petit délai pour éviter le flash : laisse le temps aux composants de monter
      const timer = setTimeout(() => setContentReady(true), 100)
      return () => clearTimeout(timer)
    }
  }, [heroLoading])

  const hasContent = !heroLoading && (
    title || subtitle || description || (stats && stats.length > 0)
  )

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16 pb-20 md:pb-0">
      <OfflineBanner />
      <InstallPrompt />

      {showPopup && selectedPromotion && (
        <PromotionPopup promotion={selectedPromotion} onClose={closePopup} />
      )}

      {/* ── HERO DESKTOP ── */}
      {heroLoading ? (
        <HeroSkeletonDesktop />
      ) : (
        <div className="relative hidden md:block w-full aspect-video">
          {bannerUrlDesktop && (
            <Image
              src={bannerUrlDesktop}
              alt="Vitogaz - Gaz domestique"
              fill
              priority
              unoptimized
              quality={90}
              className="object-cover object-center"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-black/10" />

          {hasContent && showGlassCard && (
            <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative max-w-2xl mx-auto backdrop-blur-md bg-white/10 dark:bg-black/20 p-8 md:p-10 rounded-2xl border border-white/20 shadow-2xl">
                  <button
                    onClick={() => setShowGlassCard(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 transition-all duration-200 group"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                  {title && (
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-4 tracking-tight animate-slide-up drop-shadow-2xl text-center">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-6 tracking-tight animate-slide-up drop-shadow-lg text-center" style={{ animationDelay: '0.05s' }}>
                      {subtitle}
                    </h2>
                  )}
                  {description && (
                    <p className="text-base text-white/95 leading-relaxed mb-8 animate-slide-up drop-shadow-lg text-center max-w-xl mx-auto" style={{ animationDelay: '0.1s' }}>
                      {description}
                    </p>
                  )}
                  {(title || subtitle || description) && stats.length > 0 && (
                    <div className="w-16 h-1 bg-white mb-8 rounded-full animate-slide-up drop-shadow-lg mx-auto" style={{ animationDelay: '0.15s' }} />
                  )}
                  {stats.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                      {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xl sm:text-2xl font-semibold text-white mb-1 drop-shadow-lg">{stat.value}</div>
                          <div className="text-xs font-medium text-white/90 drop-shadow-md">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {hasContent && !showGlassCard && (
            <div className="absolute bottom-8 right-8 animate-fade-in">
              <button
                onClick={() => setShowGlassCard(true)}
                className="flex items-center gap-2 px-4 py-3 backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-full border border-white/30 shadow-lg transition-all duration-200"
              >
                <Info className="w-5 h-5 text-white" />
                <span className="text-white font-medium text-sm">Infos</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── HERO MOBILE ── */}
      {heroLoading ? (
        <HeroSkeletonMobile />
      ) : (
        <div className="relative block md:hidden w-full aspect-[4/5]">
          {bannerUrlMobile && (
            <Image
              src={bannerUrlMobile}
              alt="Vitogaz - Gaz domestique"
              fill
              priority
              unoptimized
              quality={90}
              className="object-cover object-center"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-black/10" />

          {hasContent && showGlassCard && (
            <div className="absolute inset-0 flex items-center justify-center px-4 animate-fade-in">
              <div className="relative w-full max-w-sm backdrop-blur-md bg-white/10 dark:bg-black/20 p-6 rounded-2xl border border-white/20 shadow-2xl">
                <button
                  onClick={() => setShowGlassCard(false)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 transition-all duration-200 group"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
                {title && (
                  <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight animate-slide-up drop-shadow-2xl text-center pr-8">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <h2 className="text-base font-medium text-white mb-4 tracking-tight animate-slide-up drop-shadow-lg text-center" style={{ animationDelay: '0.05s' }}>
                    {subtitle}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-white/95 leading-relaxed mb-6 animate-slide-up drop-shadow-lg text-center" style={{ animationDelay: '0.1s' }}>
                    {description}
                  </p>
                )}
                {(title || subtitle || description) && stats.length > 0 && (
                  <div className="w-12 h-1 bg-white mb-6 rounded-full animate-slide-up drop-shadow-lg mx-auto" style={{ animationDelay: '0.15s' }} />
                )}
                {stats.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-lg font-semibold text-white mb-0.5 drop-shadow-lg">{stat.value}</div>
                        <div className="text-xs font-medium text-white/90 drop-shadow-md">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {hasContent && !showGlassCard && (
            <div className="absolute bottom-6 right-6 animate-fade-in">
              <button
                onClick={() => setShowGlassCard(true)}
                className="p-3 backdrop-blur-md bg-white/20 hover:bg-white/30 rounded-full border border-white/30 shadow-lg transition-all duration-200"
              >
                <Info className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── BOUTONS PRINCIPAUX ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12 sm:pb-16">
        {!contentReady ? <MainButtonsSkeleton /> : <MainButtons />}
      </div>

      {/* ── ACTIONS RAPIDES ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        {!contentReady ? <QuickActionsSkeleton /> : <QuickActions />}
      </div>
    </main>
  )
}