import { create } from 'zustand'
import type { Reseller } from '@/types/reseller'

interface ResellerState {
  resellers: Reseller[]
  loading: boolean
  error: string | null
  fetchResellers: () => Promise<void>
}

export const useResellerStore = create<ResellerState>((set) => ({
  resellers: [],
  loading: false,
  error: null,
  fetchResellers: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('https://vito-backend-supabase.onrender.com/api/v1/resellers')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('✅ Resellers chargés depuis l API:', data.length)
      set({ resellers: data, loading: false })
    } catch (error) {
      console.error('❌ Erreur chargement resellers:', error)
      set({ error: 'Erreur de chargement des revendeurs', loading: false })
    }
  },
}))