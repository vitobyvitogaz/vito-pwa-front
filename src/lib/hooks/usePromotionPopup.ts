'use client'

import { useState, useEffect } from 'react'
import type { Promotion } from '@/types/promotion'

// Exemple de données de promotions (à remplacer par vos données réelles)
// ou importez depuis votre fichier de données
const SAMPLE_PROMOTIONS: Promotion[] = [
  // Vos promotions ici
]

export const usePromotionPopup = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [hasShownPopup, setHasShownPopup] = useState(false)

  // Méthodes de sélection de promotion
  const selectPromotion = (promotions: Promotion[]): Promotion | null => {
    if (promotions.length === 0) return null

    // Filtrer les promotions actives
    const activePromotions = promotions.filter(p => 
      p.is_active && 
      new Date(p.valid_until) > new Date() &&
      p.discount_value > 0 // Seulement les promotions avec discount > 0
    )

    if (activePromotions.length === 0) return null

    // 1. Méthode aléatoire simple
    // return activePromotions[Math.floor(Math.random() * activePromotions.length)]

    // 2. Méthode basée sur l'heure du jour (promotion différente chaque heure)
    const hour = new Date().getHours()
    const index = hour % activePromotions.length
    return activePromotions[index]

    // 3. Méthode rotation (stockée dans localStorage)
    // const lastIndex = parseInt(localStorage.getItem('lastPromotionIndex') || '0')
    // const nextIndex = (lastIndex + 1) % activePromotions.length
    // localStorage.setItem('lastPromotionIndex', nextIndex.toString())
    // return activePromotions[nextIndex]
  }

  const initializePopup = (promotions: Promotion[]) => {
    // Vérifier si on a déjà montré une popup dans cette session
    if (hasShownPopup) return

    // Attendre 2 secondes après le chargement
    setTimeout(() => {
      const promotion = selectPromotion(promotions)
      if (promotion) {
        setSelectedPromotion(promotion)
        setShowPopup(true)
        setHasShownPopup(true)
        
        // Marquer comme vue dans localStorage pour X heures
        const viewedPromotions = JSON.parse(localStorage.getItem('viewedPromotions') || '{}')
        viewedPromotions[promotion.id] = Date.now()
        localStorage.setItem('viewedPromotions', JSON.stringify(viewedPromotions))
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