'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { MainButtons } from '@/components/home/MainButtons'
import { QuickActions } from '@/components/home/QuickActions'
import { TrustBadges } from '@/components/home/TrustBadges'
import { InstallPrompt } from '@/components/layout/InstallPrompt'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { PromotionPopup } from '@/components/promotions/PromotionPopup'
import { usePromotionPopup } from '@/lib/hooks/usePromotionPopup'
import { useHeroContent } from '@/lib/hooks/useAppSettings'
import { promotions } from '@/data/promotions'

export default function HomePage() {
  const { showPopup, selectedPromotion, initializePopup, closePopup } = usePromotionPopup()
  const { bannerUrlDesktop, bannerUrlMobile, title, subtitle, description, stats, loading: heroLoading } = useHeroContent()

  useEffect(() => {
    initializePopup(promotions)
  }, [initializePopup])

  // LOG TEMPORAIRE POUR DEBUGGING
  console.log('🔍 Hero Content:', { 
    bannerUrlDesktop, 
    bannerUrlMobile, 
    loading: heroLoading 
  })

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-dark-bg pt-14 sm:pt-16">
      <OfflineBanner />
      <InstallPrompt />

      {/* Popup promotion */}
      {showPopup && selectedPromotion && (
        <PromotionPopup
          promotion={selectedPromotion}
          onClose={closePopup}
        />
      )}

      {/* ================================================================
          HERO BANNER - ART DIRECTION
          - DESKTOP : ratio 16:9 exact + gradient gauche fort → transparent
          - MOBILE  : ratio 4:5 exact + gradient haut fort → transparent
          ================================================================ */}

      {/* DESKTOP - visible à partir de md (768px) */}
      <div className="relative hidden md:block w-full aspect-video">

        {/* Image complète 16:9 - PAS de rognage */}
        {!heroLoading && bannerUrlDesktop && (
          <Image
            src={bannerUrlDesktop}
            alt="Vitogaz - Gaz domestique"
            fill
            priority
            unoptimized  // ← AJOUTER CECI
            quality={90}
            className="object-cover object-center"
            sizes="100vw"
          />
        )}

        {/* Fallback chargement */}
        {heroLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
        )}

        {/* Gradient directionnel DESKTOP :
            Fort à gauche (zone texte) → transparent à droite (image visible) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

        {/* Gradient vertical léger pour le bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Contenu texte - GAUCHE */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-4 tracking-tight animate-slide-up drop-shadow-2xl text-left">
                {heroLoading ? '...' : title}
              </h1>

              <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-6 tracking-tight animate-slide-up drop-shadow-lg text-left" style={{ animationDelay: '0.05s' }}>
                {heroLoading ? '...' : subtitle}
              </h2>

              <p className="text-base text-white/95 leading-relaxed mb-8 animate-slide-up drop-shadow-lg text-left" style={{ animationDelay: '0.1s' }}>
                {heroLoading ? 'Chargement...' : description}
              </p>

              <div className="w-16 h-1 bg-white mb-8 rounded-full animate-slide-up drop-shadow-lg" style={{ animationDelay: '0.15s' }} />

              <div className="flex flex-wrap gap-6 sm:gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {heroLoading ? (
                  <>
                    <div className="animate-pulse">
                      <div className="h-8 w-16 bg-white/20 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-white/20 rounded"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-8 w-16 bg-white/20 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-white/20 rounded"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-8 w-16 bg-white/20 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-white/20 rounded"></div>
                    </div>
                  </>
                ) : (
                  stats.map((stat, index) => (
                    <div key={index} className="text-left">
                      <div className="text-xl sm:text-2xl font-semibold text-white mb-1 drop-shadow-lg">
                        {stat.value}
                      </div>
                      <div className="text-xs font-medium text-white/90 drop-shadow-md">
                        {stat.label}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE - visible en dessous de md (768px) */}
      <div className="relative block md:hidden w-full aspect-[4/5]">

        {/* Image complète 4:5 - PAS de rognage */}
        {!heroLoading && bannerUrlMobile && (
          <Image
            src={bannerUrlMobile}
            alt="Vitogaz - Gaz domestique"
            fill
            priority
            unoptimized  // ← AJOUTER CECI
            quality={90}
            className="object-cover object-center"
            sizes="100vw"
          />
        )}

        {/* Fallback chargement */}
        {heroLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
        )}

        {/* Gradient directionnel MOBILE :
            Fort en haut (zone texte) → transparent en bas (image visible) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-transparent" />

        {/* Contenu texte - HAUT */}
        <div className="absolute inset-0 flex items-start">
          <div className="container mx-auto px-4 pt-8">
            <div className="max-w-sm">

              <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight animate-slide-up drop-shadow-2xl text-left">
                {heroLoading ? '...' : title}
              </h1>

              <h2 className="text-base font-medium text-white mb-4 tracking-tight animate-slide-up drop-shadow-lg text-left" style={{ animationDelay: '0.05s' }}>
                {heroLoading ? '...' : subtitle}
              </h2>

              <p className="text-sm text-white/95 leading-relaxed mb-6 animate-slide-up drop-shadow-lg text-left" style={{ animationDelay: '0.1s' }}>
                {heroLoading ? 'Chargement...' : description}
              </p>

              <div className="w-12 h-1 bg-white mb-6 rounded-full animate-slide-up drop-shadow-lg" style={{ animationDelay: '0.15s' }} />

              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {heroLoading ? (
                  <>
                    <div className="animate-pulse">
                      <div className="h-6 w-12 bg-white/20 rounded mb-1"></div>
                      <div className="h-3 w-20 bg-white/20 rounded"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-6 w-12 bg-white/20 rounded mb-1"></div>
                      <div className="h-3 w-20 bg-white/20 rounded"></div>
                    </div>
                  </>
                ) : (
                  stats.map((stat, index) => (
                    <div key={index} className="text-left">
                      <div className="text-lg font-semibold text-white mb-0.5 drop-shadow-lg">
                        {stat.value}
                      </div>
                      <div className="text-xs font-medium text-white/90 drop-shadow-md">
                        {stat.label}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 boutons principaux */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12 sm:pb-16">
        <MainButtons />
      </div>

      {/* Badges de confiance */}
      {/*}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <TrustBadges />
      </div>
      */}

      {/* Actions rapides */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <QuickActions />
      </div>
    </main>
  )
}