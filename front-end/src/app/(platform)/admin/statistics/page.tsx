'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { adminService } from '@/services/admin'
import { tmdbService } from '@/services/tmdb'
import api from '@/services/api'
import type { AdminUserSummary, BlacklistEntry } from '@/services/admin'
import { AdminSubMenu } from '@/components/features/admin/AdminSubMenu'
import { PanelIcon } from '@/components/features/admin/AdminDashboard'

const ADMIN_SUB_MENU_ITEMS = [
  { label: 'Painel', href: '/admin' },
  { label: 'Gestão de Contas', href: '/admin/accounts' },
  { label: 'Gestão de Conteúdos', href: '/admin/contents' },
  { label: 'Estatísticas', href: '/admin/statistics' },
]

function formatNumber(value: number) {
  if (value > 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value > 1000) return (value / 1000).toFixed(1) + 'K'
  return new Intl.NumberFormat('pt-BR').format(value)
}

type TopRatedContent = {
  id: number
  title: string
  type: string
  average: number
  totalReviews: number
}

export default function AdminStatisticsPage() {
  const { user } = useAuth()
  const isManager = user?.role === 'manager'
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [totalMovies, setTotalMovies] = useState(0)
  const [totalShows, setTotalShows] = useState(0)
  const [topContents, setTopContents] = useState<TopRatedContent[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isManager) return

    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      try {
        const [usersRes, blacklistRes, moviesRes, showsRes] = await Promise.all([
          adminService.getUsers(),
          adminService.getBlacklist(),
          tmdbService.getTrendingMovies(),
          tmdbService.getTrendingShows()
        ])

        if (cancelled) return

        setUsers(usersRes.data.data.users ?? [])
        setBlacklist(blacklistRes.data.data.blacklist ?? [])
        
        setTotalMovies(moviesRes.data.total_results || 0)
        setTotalShows(showsRes.data.total_results || 0)

        // Combinar conteúdos em alta para extrair o top 5 mais bem avaliado internamente
        const trendingMovies = moviesRes.data.results.slice(0, 15).map((m: any) => ({ ...m, mediaType: 'movie' }))
        const trendingShows = showsRes.data.results.slice(0, 15).map((s: any) => ({ ...s, mediaType: 'tv' }))
        const combined = [...trendingMovies, ...trendingShows]

        // Requisições assíncronas para pegar as avaliações no backend
        const ratingsPromises = combined.map(async (item) => {
          try {
            const res = await api.get(`/reviews/${item.id}`)
            return {
              id: item.id,
              title: item.title || item.name,
              type: item.mediaType === 'movie' ? 'Filme' : 'Série',
              average: res.data?.average || 0,
              totalReviews: res.data?.total || 0
            }
          } catch {
            return {
              id: item.id,
              title: item.title || item.name,
              type: item.mediaType === 'movie' ? 'Filme' : 'Série',
              average: 0,
              totalReviews: 0
            }
          }
        })

        const ratedItems = await Promise.all(ratingsPromises)

        // Pega apenas conteúdos que receberam alguma avaliação (totalReviews > 0)
        // e os ordena primeiro por média e depois por quantidade de avaliações
        const top5 = ratedItems
          .filter(item => item.totalReviews > 0)
          .sort((a, b) => b.average - a.average || b.totalReviews - a.totalReviews)
          .slice(0, 5)

        setTopContents(top5)

      } catch (err) {
        console.error('Erro ao carregar estatísticas reais:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()

    return () => { cancelled = true }
  }, [isManager])

  if (!mounted) {
    return <div className="min-h-[calc(100vh-5rem)] bg-black text-white" />
  }

  if (!isManager) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-10">
        <section className="border border-border bg-surface p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Acesso restrito</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white">Painel de Gerenciamento</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Esta área está disponível apenas para usuários com perfil de gerente.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded border border-border px-5 py-2.5 text-sm text-text-secondary hover:text-white hover:border-text-secondary transition-colors"
            >
              Voltar para a home
            </Link>
          </div>
        </section>
      </div>
    )
  }

  // Cálculos baseados nos dados reais da API
  const activeSubscribers = users.filter((item) => item.plan !== 'free').length
  const freeUsers = users.filter((item) => item.plan === 'free').length
  const blockedMoviesCount = blacklist.filter((entry) => entry.mediaType === 'movie').length
  const blockedShowsCount = blacklist.filter((entry) => entry.mediaType === 'tv').length

  const moviesCount = Math.max(0, totalMovies - blockedMoviesCount)
  const showsCount = Math.max(0, totalShows - blockedShowsCount)

  const planCounts = {
    free: users.filter((u) => u.plan === 'free').length,
    basic: users.filter((u) => u.plan === 'basic').length,
    pro: users.filter((u) => u.plan === 'pro').length,
  }

  const maxUsersInPlan = Math.max(planCounts.free, planCounts.basic, planCounts.pro, 1)

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-[calc(100vh-5rem)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_28%)]" />

      <div className="relative max-w-screen-2xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-20">
        <AdminSubMenu items={ADMIN_SUB_MENU_ITEMS} />

        <section className="mt-6 md:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface-elevated">
              <PanelIcon />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Painel de Estatísticas</h1>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Assinantes (Planos Pagos)" value={loading ? '...' : formatNumber(activeSubscribers)} />
          <StatCard title="Usuários (Plano Free)" value={loading ? '...' : formatNumber(freeUsers)} />
          <StatCard title="Filmes no Acervo" value={loading ? '...' : formatNumber(moviesCount)} />
          <StatCard title="Séries no Acervo" value={loading ? '...' : formatNumber(showsCount)} />
        </section>

        <section className="mt-6 flex flex-col xl:flex-row gap-6 items-stretch">
          {/* Gráfico de Usuários por Plano */}
          <div className="flex-1 border border-border bg-black/95 backdrop-blur-sm p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-white">Total de Usuários por Plano</h2>
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <div className="flex items-end justify-around h-[250px] mt-8 px-4 sm:px-12 border-b border-[#333] pb-2">
                {Object.entries(planCounts).map(([plan, count]) => (
                  <div key={plan} className="flex flex-col items-center gap-2 w-16 md:w-28 group">
                    <span className="text-sm font-semibold text-white transition-opacity">{count}</span>
                    <div
                      className="w-full bg-[#3483FA] rounded-t-sm transition-all duration-700 ease-out group-hover:bg-[#73A9FF]"
                      style={{ 
                        height: loading ? '0px' : `${(count / maxUsersInPlan) * 200}px`, 
                        minHeight: (!loading && count > 0) ? '4px' : '0px' 
                      }}
                    />
                    <span className="text-sm font-medium text-text-secondary uppercase mt-2">{plan}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 5 Section */}
          <div className="w-full xl:w-96 shrink-0 border border-border bg-black/95 backdrop-blur-sm p-6 flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Top 5 Melhor Avaliados</h2>
             </div>

             <div className="flex flex-col gap-5">
                {loading ? (
                   [1,2,3,4,5].map(i => <div key={i} className="h-10 animate-pulse bg-surface/50 rounded" />)
                ) : topContents.length > 0 ? (
                   topContents.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-3">
                         <div className="w-6 text-sm font-bold text-[#888] text-center">{index + 1}</div>
                         <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-[#d5d4d4] truncate">{item.title}</h3>
                            <p className="text-xs text-[#888]">{item.type}</p>
                         </div>
                         <div className="text-right shrink-0">
                            <div className="text-sm font-semibold text-[#ffb4b7]">
                               ★ {item.average.toFixed(1)}
                            </div>
                            <div className="text-xs text-[#00a650]">{item.totalReviews} av.</div>
                         </div>
                      </div>
                   ))
                ) : (
                  <div className="py-8 text-center text-sm text-text-secondary">
                    Nenhum título avaliado no momento.
                  </div>
                )}
             </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="flex flex-col justify-between border border-border bg-black px-5 py-6">
      <h2 className="text-sm font-medium text-[#d5d4d4]">{title}</h2>
      <p className="mt-4 text-4xl font-bold text-white">{value}</p>
    </article>
  )
}