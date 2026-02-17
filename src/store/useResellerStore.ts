import { create } from 'zustand'
import type { Reseller } from '@/types/reseller'

interface ResellerState {
  resellers: Reseller[]
  loading: boolean
  error: string | null
  fetchResellers: () => Promise<void>
}

/**
 * Fonction utilitaire pour retry avec délai exponentiel
 * Idéal pour gérer le réveil des serveurs Render.com gratuits
 */
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> => {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentative ${attempt + 1}/${maxRetries + 1} de chargement des revendeurs...`)
      
      const response = await fetch(url, options)
      
      if (response.ok) {
        console.log(`✅ Réponse OK après ${attempt + 1} tentative(s)`)
        return response
      }

      // Si erreur HTTP mais pas de timeout, on ne retry pas
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error as Error
      
      // Si c'est la dernière tentative, on throw
      if (attempt === maxRetries) {
        console.error(`❌ Échec après ${maxRetries + 1} tentatives`)
        throw lastError
      }

      // Délai exponentiel : 1s, 2s, 4s...
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`⏳ Attente de ${delay}ms avant la prochaine tentative...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Échec inattendu')
}

export const useResellerStore = create<ResellerState>((set) => ({
  resellers: [],
  loading: false,
  error: null,
  fetchResellers: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetchWithRetry(
        'https://vito-backend-supabase.onrender.com/api/v1/resellers',
        {},
        3, // 3 retries max (= 4 tentatives au total)
        1000 // 1 seconde de base
      )

      const data = await response.json()
      
      // Mapper les données du backend vers le format frontend
      const mappedResellers = data.map((r: any) => ({
        ...r,
        lat: r.latitude,
        lng: r.longitude
      }))
      
      console.log('✅ Resellers chargés depuis l API:', mappedResellers.length)
      set({ resellers: mappedResellers, loading: false })
    } catch (error) {
      console.error('❌ Erreur chargement resellers:', error)
      set({ 
        error: error instanceof Error 
          ? `Impossible de charger les revendeurs: ${error.message}` 
          : 'Erreur de chargement des revendeurs', 
        loading: false 
      })
    }
  },
}))