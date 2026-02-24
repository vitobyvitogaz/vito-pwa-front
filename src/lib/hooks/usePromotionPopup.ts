'use client'

import { useState } from 'react'
import type { Promotion } from '@/types/promotion'

export const usePromotionPopup = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)

  const selectPromotion = (promotions: Promotion[]): Promotion | null => {
    if (promotions.length === 0) return null

    const activePromotions = promotions.filter(p => 
      p.is_active && 
      new Date(p.valid_until) > new Date()
      // ← discount_value retiré, une promo sans réduction chiffrée est valide
    )

    if (activePromotions.length === 0) return null

    const hour = new Date().getHours()
    const index = hour % activePromotions.length
    return activePromotions[index]
  }

  const initializePopup = (promotions: Promotion[]) => {
    setTimeout(() => {
      const promotion = selectPromotion(promotions)
      if (promotion) {
        setSelectedPromotion(promotion)
        setShowPopup(true)
      }
    }, 2000)
  }

  const closePopup = () => {
    setShowPopup(false)
    setSelectedPromotion(null)
  }

  return {
    showPopup,
    selectedPromotion,
    initializePopup,
    closePopup,
  }
}