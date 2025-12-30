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
import { useHeroBanner } from '@/lib/hooks/useAppSettings'
import { promotions } from '@/data/promotions'

export default function HomePage() {
  const { showPopup, selectedPromotion, initializePopup, closePopup } = usePromotionPopup()
  const { bannerUrl, loading: bannerLoading } = useHeroBanner()

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
          {!bannerLoading && bannerUrl && (
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
          {bannerLoading && (
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
            {/* Titre principal - blanc pour contraste sur image */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-4 tracking-tight animate-slide-up drop-shadow-lg">
              VITO
            </h1>
            
            {/* Sous-titre - blanc avec drop shadow */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-6 tracking-tight animate-slide-up drop-shadow-md" style={{ animationDelay: '0.05s' }}>
              Rapide. Fiable. Centré sur l'essentiel.
            </h2>
            
            {/* Paragraphe descriptif - blanc avec opacité légère */}
            <p className="text-base text-white/95 leading-relaxed max-w-2xl mx-auto mb-8 animate-slide-up drop-shadow-md" style={{ animationDelay: '0.1s' }}>
              VITO transforme votre expérience Vitogaz. Quatre boutons simples vous donnent un contrôle total : trouver un revendeur, commander en ligne, être au courant des promotions et gérer votre prêt PAMF pour acheter votre gaz.
            </p>
            
            {/* Ligne décorative - blanc éclatant */}
            <div className="w-16 h-1 bg-white mx-auto mb-8 rounded-full animate-slide-up drop-shadow-lg" style={{ animationDelay: '0.15s' }} />
            
            {/* Mini stats discrètes - blanc pour contraste */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-semibold text-white mb-1 drop-shadow-md">+100</div>
                <div className="text-xs font-medium text-white/90 drop-shadow-sm">Points de vente</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-semibold text-white mb-1 drop-shadow-md">24/7</div>
                <div className="text-xs font-medium text-white/90 drop-shadow-sm">Service client</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-semibold text-white mb-1 drop-shadow-md">100%</div>
                <div className="text-xs font-medium text-white/90 drop-shadow-sm">Sécurité garantie</div>
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