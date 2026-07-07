import api from '@/services/api'
import type { Plan, Role } from '@/types'

export interface AdminStats {
  totalUsers: number
  totalBlacklist: number
}

export interface AdminUserSummary {
  _id: string
  name: string
  email: string
  role: Role
  plan: Plan
  createdAt: string
}

export interface BlacklistEntry {
  _id: string
  tmdbId: number
  mediaType: 'movie' | 'tv'
  addedBy?: string
  createdAt?: string
}

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getBlacklist: () => api.get('/admin/blacklist'),
  addToBlacklist: (tmdbId: number, mediaType: 'movie' | 'tv') => api.post('/admin/blacklist', { tmdbId, mediaType }),
  removeFromBlacklist: (tmdbId: number) => api.delete(`/admin/blacklist/${tmdbId}`),
  updateUserPlan: (id: string, plan: Plan) => api.patch(`/admin/users/${id}/plan`, { plan }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
}