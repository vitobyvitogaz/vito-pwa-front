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
      const response = await fetch('/api/revendeurs')
      const data = await response.json()
      set({ resellers: data, loading: false })
    } catch (error) {
      set({ error: 'Erreur de chargement', loading: false })
    }
  },
}))