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

export default function HomePage() {
  const { showPopup, selectedPromotion, initializePopup, closePopup } = usePromotionPopup()
  const { bannerUrlDesktop, bannerUrlMobile, title, subtitle, description, stats, loading: heroLoading } = useHeroContent()
  const [showGlassCard, setShowGlassCard] = useState(true)

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

  const hasContent = !heroLoading && (
    title ||
    subtitle ||
    description ||
    (stats && stats.length > 0)
  )

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

      {/* DESKTOP */}
      <div className="relative hidden md:block w-full aspect-video">
        {!heroLoading && bannerUrlDesktop && (
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
        {heroLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
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

      {/* MOBILE */}
      <div className="relative block md:hidden w-full aspect-[4/5]">
        {!heroLoading && bannerUrlMobile && (
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
        {heroLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
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

      {/* Boutons principaux */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12 sm:pb-16">
        <MainButtons />
      </div>

      {/* Actions rapides */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <QuickActions />
      </div>
    </main>
  )
}