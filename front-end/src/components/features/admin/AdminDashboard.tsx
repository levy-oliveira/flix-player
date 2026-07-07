'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AdminSubMenu } from '@/components/features/admin/AdminSubMenu'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { adminService } from '@/services/admin'
import { tmdbImage, tmdbService } from '@/services/tmdb'
import type { AdminStats, AdminUserSummary, BlacklistEntry } from '@/services/admin'
import type { TMDBMovie, TMDBShow } from '@/types'

type DashboardContent = {
  id: number
  title: string
  mediaType: 'movie' | 'tv'
  subtitle: string
  posterPath: string | null
  blocked: boolean
}

const ADMIN_SUB_MENU_ITEMS = [
  { label: 'Painel', href: '/admin' },
  { label: 'Gestão de Contas', href: '/admin/accounts' },
  { label: 'Gestão de Conteúdos', href: '/admin/contents' },
  { label: 'Estatísticas', href: '/admin#estatisticas' },
]

export function AdminDashboard() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalBlacklist: 0 })
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [contents, setContents] = useState<DashboardContent[]>([])
  const [totalMovies, setTotalMovies] = useState(0)
  const [totalShows, setTotalShows] = useState(0)
  const [savingContentId, setSavingContentId] = useState<number | null>(null)

  const isManager = user?.role === 'manager'

  const blockedMoviesCount = useMemo(() => blacklist.filter((entry) => entry.mediaType === 'movie').length, [blacklist])
  const blockedShowsCount = useMemo(() => blacklist.filter((entry) => entry.mediaType === 'tv').length, [blacklist])

  const catalogCounts = useMemo(
    () => ({
      movies: Math.max(0, totalMovies - blockedMoviesCount),
      shows: Math.max(0, totalShows - blockedShowsCount),
    }),
    [totalMovies, totalShows, blockedMoviesCount, blockedShowsCount],
  )

  const activeSubscribers = users.filter((item) => item.plan !== 'free').length

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isManager) return

    let cancelled = false

    const loadDashboard = async () => {
      setLoading(true)
      setError('')

      try {
        const [statsResult, usersResult, blacklistResult, moviesResult, showsResult] = await Promise.allSettled([
          adminService.getStats(),
          adminService.getUsers(),
          adminService.getBlacklist(),
          tmdbService.getTrendingMovies(),
          tmdbService.getTrendingShows(),
        ])

        if (cancelled) return

        const blacklistItems =
          blacklistResult.status === 'fulfilled' ? blacklistResult.value.data.data.blacklist ?? [] : []
        const blockedIds = new Set(blacklistItems.map((entry: BlacklistEntry) => entry.tmdbId))

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value.data.data)
        }

        if (usersResult.status === 'fulfilled') {
          setUsers(usersResult.value.data.data.users ?? [])
        }

        if (blacklistResult.status === 'fulfilled') {
          setBlacklist(blacklistItems)
        }

        const movieItems =
          moviesResult.status === 'fulfilled'
            ? moviesResult.value.data.results.slice(0, 3).map((movie: TMDBMovie) => ({
                id: movie.id,
                title: movie.title,
                mediaType: 'movie' as const,
                subtitle: movie.release_date
                  ? `Filme • Lançamento: ${new Date(movie.release_date).getFullYear()}`
                  : 'Filme • Lançamento indisponível',
                posterPath: movie.poster_path,
                blocked: blockedIds.has(movie.id),
              }))
            : []

        const showItems =
          showsResult.status === 'fulfilled'
            ? showsResult.value.data.results.slice(0, 2).map((show: TMDBShow) => ({
                id: show.id,
                title: show.name,
                mediaType: 'tv' as const,
                subtitle: show.number_of_seasons
                  ? `Série • ${show.number_of_seasons} Temporadas`
                  : show.first_air_date
                    ? `Série • Lançamento: ${new Date(show.first_air_date).getFullYear()}`
                    : 'Série • Em destaque',
                posterPath: show.poster_path,
                blocked: blockedIds.has(show.id),
              }))
            : []

        setContents([...movieItems, ...showItems])
        setTotalMovies(moviesResult.status === 'fulfilled' ? moviesResult.value.data.total_results : 0)
        setTotalShows(showsResult.status === 'fulfilled' ? showsResult.value.data.total_results : 0)

        const baseError = statsResult.status === 'rejected' || usersResult.status === 'rejected'
        if (baseError) {
          setError('Não foi possível carregar todos os dados do painel.')
        }
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar o painel de gerenciamento.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [isManager])

  if (!mounted) {
    return <div className="min-h-[calc(100vh-5rem)] bg-black text-white" />
  }

  if (!isManager) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-8">
        <section className="border border-border bg-surface p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Acesso restrito</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Painel de Gerenciamento</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Esta área está disponível apenas para usuários com perfil de gerente.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded border border-border px-5 py-2.5 text-sm text-text-secondary transition-colors hover:border-text-secondary hover:text-white"
            >
              Voltar para a home
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const handleToggleBlacklist = async (content: DashboardContent) => {
    setSavingContentId(content.id)
    try {
      if (content.blocked) {
        await adminService.removeFromBlacklist(content.id)
        setBlacklist((current) => current.filter((item) => item.tmdbId !== content.id))
      } else {
        await adminService.addToBlacklist(content.id, content.mediaType)
        setBlacklist((current) => [...current, { _id: String(content.id), tmdbId: content.id, mediaType: content.mediaType }])
      }

      setContents((current) =>
        current.map((item) => (item.id === content.id ? { ...item, blocked: !content.blocked } : item)),
      )
      setStats((current) => ({
        ...current,
        totalBlacklist: content.blocked ? Math.max(0, current.totalBlacklist - 1) : current.totalBlacklist + 1,
      }))
    } finally {
      setSavingContentId(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-black text-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 pb-20 md:px-8 md:py-8">
        <AdminSubMenu items={ADMIN_SUB_MENU_ITEMS} />

        <section className="mt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#d5d4d4] bg-black">
              <PanelIcon />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Painel de Gerenciamento</h1>
          </div>

          {error && <p className="mt-4 text-sm text-[#f4a5a8]">{error}</p>}
        </section>

        <section id="estatisticas" className="mt-8 grid gap-4 md:grid-cols-3">
          {loading ? (
            [0, 1, 2].map((item) => (
              <div key={item} className="h-40 animate-pulse border border-border bg-surface" />
            ))
          ) : (
            <>
              <StatCard title="Assinantes Ativos" value={formatNumber(activeSubscribers)} />
              <StatCard title="Filmes no Acervo" value={formatNumber(catalogCounts.movies)} />
              <StatCard title="Séries no Acervo" value={formatNumber(catalogCounts.shows)} />
            </>
          )}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          {/* Gestão de Contas */}
          <section aria-labelledby="contas-title" className="border border-border bg-black flex flex-col">
            <header className="border-b border-[#333] px-4 py-5 md:px-6">
              <h2 id="contas-title" className="text-xl font-semibold text-white md:text-2xl">
                Gestão de Contas
              </h2>
            </header>

            <div className="divide-y divide-[#222] px-4 md:px-6 flex-1">
              {loading ? (
                [0, 1, 2].map((item) => (
                  <div key={item} className="h-16 animate-pulse bg-surface/50 my-4" />
                ))
              ) : users.length > 0 ? (
                users.slice(0, 5).map((account, index) => (
                  <article key={account._id} className="flex items-center justify-between gap-4 py-4">
                    <div className="text-sm text-text-secondary w-20 shrink-0">
                      ID: {String(index + 1).padStart(6, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-base font-semibold text-white">{account.name}</h3>
                    </div>
                    <div className="text-sm text-[#d5d4d4] hidden sm:block shrink-0">
                      {formatAccountLevel(account)}
                    </div>
                    <Link
                      href="/admin/accounts"
                      className="shrink-0 rounded border border-border px-4 py-1.5 text-sm font-medium text-[#d5d4d4] hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Gerenciar
                    </Link>
                  </article>
                ))
              ) : (
                <p className="py-8 text-sm text-text-secondary">Nenhuma conta encontrada.</p>
              )}
            </div>

            <div className="border-t border-[#222] py-4 text-center mt-auto">
              <Link
                href="/admin/accounts"
                className="text-sm font-semibold text-[#d5d4d4] transition-colors hover:text-white"
              >
                Visualizar lista completa
              </Link>
            </div>
          </section>

          {/* Gestão de Conteúdos */}
          <section id="conteudos" aria-labelledby="conteudos-title" className="border border-border bg-black flex flex-col">
            <header className="flex items-center justify-between gap-4 border-b border-[#333] px-4 py-5 md:px-6">
              <h2 id="conteudos-title" className="text-xl font-semibold text-white md:text-2xl">
                Gestão de Conteúdos
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => alert('Abrir modal de série')}
                  className="border-[#d5d4d4] text-[#d5d4d4] hover:bg-white/5 hover:text-white bg-transparent"
                >
                  + Série
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => alert('Abrir modal de filme')}
                  className="border-[#d5d4d4] text-[#d5d4d4] hover:bg-white/5 hover:text-white bg-transparent"
                >
                  + Filme
                </Button>
              </div>
            </header>

            <div className="divide-y divide-[#222] px-4 md:px-6 flex-1">
              {loading ? (
                [0, 1, 2].map((item) => (
                  <div key={item} className="h-20 animate-pulse bg-surface/50 my-4" />
                ))
              ) : contents.length > 0 ? (
                contents.slice(0, 5).map((item) => (
                  <article key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-[60px] w-10 shrink-0 items-center justify-center overflow-hidden border border-[#333] bg-[#222]">
                        {item.posterPath ? (
                          <img src={tmdbImage(item.posterPath, 'w185')} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[8px] uppercase tracking-[0.2em] text-text-muted">{item.mediaType}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 truncate text-xs text-text-secondary">{item.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-sm text-text-secondary hidden md:block">
                        {item.blocked ? 'Indisponível no catálogo' : 'Disponível para usuários'}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        loading={savingContentId === item.id}
                        onClick={() => void handleToggleBlacklist(item)}
                        className={item.blocked 
                          ? "border-[#d5d4d4] text-[#d5d4d4] hover:text-white bg-transparent" 
                          : "border-[#e50914] bg-transparent text-[#e50914] hover:bg-[#e50914]/10 hover:text-[#ffb4b7]"
                        }
                      >
                        {item.blocked ? 'Adicionar ao Acervo' : 'Remover do Acervo'}
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="py-8 text-sm text-text-secondary">Nenhum conteúdo disponível para gestão.</p>
              )}
            </div>

            <div className="border-t border-[#222] py-4 text-center mt-auto">
              <Link
                href="/admin/contents"
                className="text-sm font-semibold text-[#d5d4d4] transition-colors hover:text-white"
              >
                Visualizar lista completa
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="flex min-h-40 flex-col justify-between border border-border bg-black px-4 py-6 md:px-6">
      <h2 className="text-base font-normal text-[#d5d4d4] md:text-lg">{title}</h2>
      <p className="mt-4 text-4xl font-semibold leading-none text-white md:text-6xl">{value}</p>
    </article>
  )
}

export function PanelIcon() {
  return (
    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M8 9h8M8 13h8M8 17h4" />
    </svg>
  )
}

function formatAccountLevel(account: AdminUserSummary) {
  if (account.role === 'manager') return 'Nível: 3 - Gerente'
  if (account.plan === 'free') return 'Nível: 1 - Sem plano ativo'
  return 'Nível: 2 - Plano ativo'
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}