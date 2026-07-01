import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import type { AuthResponse } from '@/types'

export function useAuth() {
  const router = useRouter()
  const { token, user, isAuthenticated, login, logout } = useAuthStore()

  const signIn = async (email: string, password: string) => {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/login', { email, password })
    login(data.data.token, data.data.user)
    if (data.data.user.role === 'manager') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }

  const signUp = async (name: string, email: string, password: string, plan: string) => {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/register', {
      name, email, password, plan,
    })
    login(data.data.token, data.data.user)
    router.push('/')
  }

  const signOut = () => {
    logout()
    router.push('/login')
  }

  return { token, user, isAuthenticated, signIn, signUp, signOut }
}