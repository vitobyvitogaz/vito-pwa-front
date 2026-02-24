'use client'

import { useEffect } from 'react'
import { PromotionsList } from '@/components/promotions/PromotionsList'
import { NotificationToggle } from '@/components/promotions/NotificationToggle'
import { PromotionPopup } from '@/components/promotions/PromotionPopup'
import { usePromotionPopup } from '@/lib/hooks/usePromotionPopup'
import { Sparkles } from 'lucide-react'

const API_URL = 'https://vito-backend-supabase.onrender.com/api/v1'

export default function PromotionsPage() {
  const { showPopup, selectedPromotion, initializePopup, closePopup } = usePromotionPopup()

  useEffect(() => {
    console.log('🚀 PromotionsPage useEffect lancé')

    const fetchAndInitPopup = async () => {
      try {
        console.log('📡 Fetch promotions...')
        const response = await fetch(`${API_URL}/promotions`)
        console.log('📡 Response status:', response.status)

        if (!response.ok) return

        const promotions = await response.json()
        console.log('✅ Promotions reçues:', promotions.length, promotions)

        initializePopup(promotions)
        console.log('🎯 initializePopup appelé, showPopup:', showPopup)
      } catch (err) {
        console.error('❌ Erreur popup promotions:', err)
      }
    }

    fetchAndInitPopup()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-25 via-white to-neutral-25 dark:from-dark-bg dark:via-dark-surface/95 dark:to-dark-bg pt-16 pb-20">

      {/* Popup promotion */}
      {showPopup && selectedPromotion && (
        <PromotionPopup promotion={selectedPromotion} onClose={closePopup} />
      )}

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-600 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight font-sans">
            Promotions
          </h1>

          <div className="max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed tracking-wide font-sans">
              Profitez de nos offres exclusives et réductions sur le gaz
            </p>
            <div className="h-px w-24 mx-auto mt-6 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent"></div>
          </div>
        </div>

        {/* Notification toggle */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <NotificationToggle />
        </div>

        {/* Promotions list */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <PromotionsList />
        </div>
      </div>
    </div>
  )
}