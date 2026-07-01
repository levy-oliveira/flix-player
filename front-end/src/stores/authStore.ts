import { create } from 'zustand'
import type { User } from '@/types'

// Helpers para cookie (lido pelo middleware)
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('flix_token') : null,
  user: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('flix_user') || 'null')
    : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('flix_token') : false,

  login: (token, user) => {
    localStorage.setItem('flix_token', token)
    localStorage.setItem('flix_user', JSON.stringify(user))
    setCookie('flix_token', token)
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('flix_token')
    localStorage.removeItem('flix_user')
    deleteCookie('flix_token')
    set({ token: null, user: null, isAuthenticated: false })
  },

  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state
      const updated = { ...state.user, ...partial }
      localStorage.setItem('flix_user', JSON.stringify(updated))
      return { user: updated }
    })
  },
}))