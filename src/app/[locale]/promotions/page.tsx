'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PromotionsList } from '@/components/promotions/PromotionsList'
import { NotificationToggle } from '@/components/promotions/NotificationToggle'
import { PromotionPopup } from '@/components/promotions/PromotionPopup'
import { usePromotionPopup } from '@/lib/hooks/usePromotionPopup'
import { Sparkles, Building2 } from 'lucide-react'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

export default function PromotionsPage() {
  const { showPopup, selectedPromotion, initializePopup, closePopup } = usePromotionPopup()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  useEffect(() => {
    const fetchAndInitPopup = async () => {
      try {
        const response = await fetch(`${API_URL}/promotions`)
        if (!response.ok) return
        const promotions = await response.json()
        initializePopup(promotions)
      } catch (err) {
        console.error('❌ Erreur popup promotions:', err)
      }
    }
    fetchAndInitPopup()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-25 via-white to-neutral-25 dark:from-dark-bg dark:via-dark-surface/95 dark:to-dark-bg pt-16 pb-20">

      {showPopup && selectedPromotion && (
        <PromotionPopup promotion={selectedPromotion} onClose={closePopup} />
      )}

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-600 shadow-lg">
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
        {/* Onglets niveau 1 */}
        <div className="flex justify-center mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 gap-0">
            <button
              onClick={() => router.push(`/${locale}/promotions`)}
              className="flex items-center gap-2 px-6 py-3 rounded-l-full rounded-r-none text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Promos Grand Public
            </button>
            <button
              onClick={() => router.push(`/${locale}/promotions/entreprise`)}
              className="flex items-center gap-2 px-6 py-3 rounded-r-full rounded-l-none text-sm font-semibold bg-white dark:bg-dark-surface text-primary shadow-sm transition-all duration-300"
            >
              <Building2 className="w-4 h-4" strokeWidth={1.5} />
              Offres Entreprise
            </button>
          </div>
        </div>

        {/* Contenu Grand Public */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="mb-8">
            <NotificationToggle />
          </div>
          <PromotionsList />
        </div>

      </div>
    </div>
  )
}