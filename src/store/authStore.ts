import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth'
import type { Role } from '@/lib/constants'

interface AuthState {
  user: User | null
  token: string | null
  role: Role | null
  login: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  hasRole: (role: Role | Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const tokenFromStorage = localStorage.getItem('jwt_token')
      
      return {
        user: null,
        token: tokenFromStorage,
        role: null,
        
        login: (user: User, token: string) => {
          localStorage.setItem('jwt_token', token)
          set({
            user,
            token,
            role: user.role as Role,
          })
        },
        
        logout: () => {
          localStorage.removeItem('jwt_token')
          localStorage.removeItem('user')
          set({
            user: null,
            token: null,
            role: null,
          })
        },
        
        isAuthenticated: () => {
          const { user } = get()
          const tokenFromStorage = localStorage.getItem('jwt_token')
          const token = get().token || tokenFromStorage
          return !!token && !!user
        },
        
        hasRole: (role: Role | Role[]) => {
          const { role: userRole } = get()
          if (!userRole) return false
          if (Array.isArray(role)) {
            return role.includes(userRole)
          }
          return userRole === role
        },
      }
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const tokenFromStorage = localStorage.getItem('jwt_token')
          if (tokenFromStorage && !state.token) {
            state.token = tokenFromStorage
          }
        }
      },
    }
  )
)
