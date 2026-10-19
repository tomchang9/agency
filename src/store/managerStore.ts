import { create } from 'zustand'
import type { ManagerProfile, DashboardStats } from '@/types/manager'
import { managerApi } from '@/api/manager'

interface ManagerState {
  profile: ManagerProfile | null
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  fetchStats: () => Promise<void>
  clear: () => void
}

export const useManagerStore = create<ManagerState>((set) => ({
  profile: null,
  stats: null,
  loading: false,
  error: null,
  
  fetchProfile: async () => {
    set({ loading: true, error: null })
    try {
      const response = await managerApi.getProfile()
      if (response.success && response.data) {
        set({ profile: response.data, loading: false })
      } else {
        set({ error: response.error || 'Failed to fetch profile', loading: false })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch profile', loading: false })
    }
  },
  
  fetchStats: async () => {
    set({ loading: true, error: null })
    try {
      const response = await managerApi.getStats()
      if (response.success && response.data) {
        set({ stats: response.data, loading: false })
      } else {
        set({ error: response.error || 'Failed to fetch stats', loading: false })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch stats', loading: false })
    }
  },
  
  clear: () => {
    set({ profile: null, stats: null, error: null })
  },
}))

