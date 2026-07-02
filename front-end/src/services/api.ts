import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token JWT em toda requisição autenticada
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('flix_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Redireciona para login se o token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('flix_token')
      localStorage.removeItem('flix_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api