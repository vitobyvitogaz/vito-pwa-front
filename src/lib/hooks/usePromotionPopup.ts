'use client'

import { useState } from 'react'
import type { Promotion } from '@/types/promotion'

const API_URL        = 'https://vito-backend-supabase.onrender.com/api/v1'
const POPUP_SHOWN_KEY = 'promotionPopupShown'

export interface PopupSettings {
  cooldown_hours:     number
  delay_seconds:      number
  allowed_pages:      string[]
  auto_close_seconds: number
  enabled:            boolean
}

const DEFAULT_SETTINGS: PopupSettings = {
  cooldown_hours:     48,
  delay_seconds:      3,
  allowed_pages:      ['home'],
  auto_close_seconds: 30,
  enabled:            true,
}

const fetchPopupSettings = async (): Promise<PopupSettings> => {
  try {
    const res = await fetch(`${API_URL}/settings/popup_settings`)
    if (!res.ok) return DEFAULT_SETTINGS
    const data = await res.json()
    // Le service retourne { setting_value: "..." } ou directement l'objet
    const raw    = data?.setting_value ?? data?.value ?? data
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

const isCooldownRespected = (cooldownHours: number): boolean => {
  try {
    const lastShown = localStorage.getItem(POPUP_SHOWN_KEY)
    if (!lastShown) return true
    const elapsed = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60)
    return elapsed >= cooldownHours
  } catch {
    return true
  }
}

const selectPromotion = (promotions: Promotion[]): Promotion | null => {
  if (!promotions.length) return null
  const active = promotions.filter(
    p => p.is_active && new Date(p.valid_until) > new Date()
  )
  if (!active.length) return null
  const featured = active.find(p => p.is_featured)
  if (featured) return featured
  const hour = new Date().getHours()
  return active[hour % active.length]
}

export const usePromotionPopup = () => {
  const [showPopup, setShowPopup]                 = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [popupSettings, setPopupSettings]         = useState<PopupSettings>(DEFAULT_SETTINGS)

  const initializePopup = async (
    promotions: Promotion[],
    currentPage: 'home' | 'promotions' | 'revendeurs' | 'all' = 'home',
  ) => {
    const settings = await fetchPopupSettings()
    setPopupSettings(settings)

    if (!settings.enabled) return
    if (
      !settings.allowed_pages.includes('all') &&
      !settings.allowed_pages.includes(currentPage)
    ) return
    if (!isCooldownRespected(settings.cooldown_hours)) return

    const promotion = selectPromotion(promotions)
    if (!promotion) return

    setTimeout(() => {
      setSelectedPromotion(promotion)
      setShowPopup(true)
      localStorage.setItem(POPUP_SHOWN_KEY, String(Date.now()))
    }, settings.delay_seconds * 1000)
  }

  const closePopup = () => {
    setShowPopup(false)
    setSelectedPromotion(null)
  }

  return { showPopup, selectedPromotion, popupSettings, initializePopup, closePopup }
}