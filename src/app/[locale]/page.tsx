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
  const { bannerUrl, title, subtitle, description, stats, loading: heroLoading } = useHeroContent()

  useEffect(() => {
    // Initialiser la popup avec vos données de promotions
    initializePopup(promotions)
  }, [initializePopup])

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

      {/* Bannière avec image de fond */}
      <div className="relative min-h-[70vh] sm:min-h-[80vh] flex flex-col justify-center overflow-hidden">
        {/* Image de fond - DYNAMIQUE depuis Supabase */}
        <div className="absolute inset-0 z-0">
          {!heroLoading && bannerUrl && (
            <Image
              src={bannerUrl}
              alt="Vitogaz - Gaz domestique"
              fill
              priority
              quality={90}
              className="object-cover object-center"
              sizes="100vw"
            />
          )}
          
          {/* Fallback pendant le chargement */}
          {heroLoading && (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
          )}
          
          {/* Overlay pour mode light - fond sombre léger pour textes clairs */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 dark:from-black/70 dark:via-black/60 dark:to-black/70" />
          
          {/* Overlay accent primary pour cohérence visuelle */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 dark:from-primary/30 dark:via-transparent dark:to-primary/20" />
        </div>

        {/* Contenu centré - textes par-dessus l'image */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Titre principal - DYNAMIQUE */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-4 tracking-tight animate-slide-up drop-shadow-lg">
              {heroLoading ? '...' : title}
            </h1>
            
            {/* Sous-titre - DYNAMIQUE */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-6 tracking-tight animate-slide-up drop-shadow-md" style={{ animationDelay: '0.05s' }}>
              {heroLoading ? '...' : subtitle}
            </h2>
            
            {/* Paragraphe descriptif - DYNAMIQUE */}
            <p className="text-base text-white/95 leading-relaxed max-w-2xl mx-auto mb-8 animate-slide-up drop-shadow-md" style={{ animationDelay: '0.1s' }}>
              {heroLoading ? 'Chargement...' : description}
            </p>
            
            {/* Ligne décorative */}
            <div className="w-16 h-1 bg-white mx-auto mb-8 rounded-full animate-slide-up drop-shadow-lg" style={{ animationDelay: '0.15s' }} />
            
            {/* Mini stats discrètes - DYNAMIQUES */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {heroLoading ? (
                // Skeleton pendant chargement
                <>
                  <div className="text-center animate-pulse">
                    <div className="h-8 w-16 bg-white/20 rounded mb-2 mx-auto"></div>
                    <div className="h-4 w-24 bg-white/20 rounded mx-auto"></div>
                  </div>
                  <div className="text-center animate-pulse">
                    <div className="h-8 w-16 bg-white/20 rounded mb-2 mx-auto"></div>
                    <div className="h-4 w-24 bg-white/20 rounded mx-auto"></div>
                  </div>
                  <div className="text-center animate-pulse">
                    <div className="h-8 w-16 bg-white/20 rounded mb-2 mx-auto"></div>
                    <div className="h-4 w-24 bg-white/20 rounded mx-auto"></div>
                  </div>
                </>
              ) : (
                // Stats dynamiques
                stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl sm:text-2xl font-semibold text-white mb-1 drop-shadow-md">
                      {stat.value}
                    </div>
                    <div className="text-xs font-medium text-white/90 drop-shadow-sm">
                      {stat.label}
                    </div>
                  </div>
                ))
              )}
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