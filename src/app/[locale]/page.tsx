'use client'

import { useEffect } from 'react'
import { MainButtons } from '@/components/home/MainButtons'
import { QuickActions } from '@/components/home/QuickActions'
import { TrustBadges } from '@/components/home/TrustBadges'
import { InstallPrompt } from '@/components/layout/InstallPrompt'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { PromotionPopup } from '@/components/promotions/PromotionPopup'
import { usePromotionPopup } from '@/lib/hooks/usePromotionPopup'
import { promotions } from '@/data/promotions'

export default function HomePage() {
  const { showPopup, selectedPromotion, initializePopup, closePopup } = usePromotionPopup()

  useEffect(() => {
    // Initialiser la popup avec vos données de promotions
    initializePopup(promotions)
  }, [initializePopup])

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg pt-14 sm:pt-16">
      <OfflineBanner />
      <InstallPrompt />
      
      {/* Popup promotion */}
      {showPopup && selectedPromotion && (
        <PromotionPopup
          promotion={selectedPromotion}
          onClose={closePopup}
        />
      )}

      {/* Bannière Tesla-like */}
      <div className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Overlay de texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,139,127,0.05)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Contenu centré */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Titre principal - énorme et épuré */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 tracking-tight">
              <span className="block">VITO</span>
              <span className="block text-primary-300 mt-2 sm:mt-4">
                
              </span>
            </h1>
            
            {/* Sous-titre élégant */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-300 mb-8 tracking-wide max-w-3xl mx-auto">
              Rapide. Fiable. Centré sur l'essentiel.
            </h2>
            
            {/* Paragraphe descriptif */}
            <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-12 font-light tracking-tight">
             VITO transforme votre expérience Vitogaz. Quatre boutons simples vous donnent un contrôle total : trouver un revendeur, commander en ligne, être au courant des promotions et gérer votre prêt PAMF pour acheter votre gaz. Interface épuré pour une facilité d'utilisation.
            </p>
            
            {/* Ligne décorative */}
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-12 rounded-full" />
            
            {/* Mini stats discrètes */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-white/70">
              <div className="text-center">
                <div className="text-xl sm:text-xl font-bold text-primary-300 mb-1">+100</div>
                <div className="text-xs sm:text-sm font-medium">Points de vente</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary-300 mb-1">24/7</div>
                <div className="text-xs sm:text-sm font-medium">Service client</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary-300 mb-1">100%</div>
                <div className="text-xs sm:text-sm font-medium">Sécurité garantie</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Effet de brillance subtil */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* 4 boutons principaux */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 relative z-20 pb-12 sm:pb-16">
        <MainButtons />
      </div>

      {/* Badges de confiance */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <TrustBadges />
      </div>

      {/* Actions rapides */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <QuickActions />
      </div>
    </main>
  )
}