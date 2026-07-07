'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { adminService, type BlacklistEntry } from '@/services/admin'
import { tmdbService, tmdbImage } from '@/services/tmdb'
import type { MediaType, TMDBGenre } from '@/types'
import { Button } from '@/components/ui/Button'
import { AdminSubMenu } from '@/components/features/admin/AdminSubMenu'
import { PanelIcon } from '@/components/features/admin/AdminDashboard'
import { clsx } from 'clsx'
import { Spinner } from '@/components/ui/Snipper'

const ADMIN_SUB_MENU_ITEMS = [
  { label: 'Painel', href: '/admin' },
  { label: 'Gestão de Contas', href: '/admin/accounts' },
  { label: 'Gestão de Conteúdos', href: '/admin/contents' },
  { label: 'Estatísticas', href: '/admin#estatisticas' },
]

type ContentItem = {
  id: number
  title: string
  mediaType: MediaType
  subtitle: string
  posterPath: string | null
  voteAverage: number
  popularity: number
  blocked: boolean
}

export default function AdminContentsPage() {
  const { user } = useAuth()
  const isManager = user?.role === 'manager'
  const [mounted, setMounted] = useState(false)

  const [contents, setContents] = useState<ContentItem[]>([])
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [genres, setGenres] = useState<TMDBGenre[]>([])
  const [loading, setLoading] = useState(true)
  const [savingContentId, setSavingContentId] = useState<number | null>(null)

  const [yearRange, setYearRange] = useState({ min: 1990, max: 2026 })
  const [appliedYear, setAppliedYear] = useState(2026)
  const [statusFilter, setStatusFilter] = useState<'available' | 'blocked'>('available')
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isManager) return

    let cancelled = false

    const loadContents = async () => {
      setLoading(true)
      try {
        const [blacklistRes, genresRes] = await Promise.all([
          adminService.getBlacklist(),
          tmdbService.getMovieGenres()
        ])

        if (cancelled) return

        const blockedItems = blacklistRes.data.data.blacklist || []
        setBlacklist(blockedItems)
        setGenres(genresRes.data.genres || [])

        if (statusFilter === 'blocked') {
          const items = blockedItems.map((b: BlacklistEntry) => ({
            id: b.tmdbId,
            title: `Conteúdo Indisponível (ID: ${b.tmdbId})`,
            mediaType: b.mediaType,
            subtitle: 'Bloqueado no painel',
            posterPath: null,
            voteAverage: 0,
            popularity: 0,
            blocked: true
          }))
          
          const pageSize = 20
          setTotalResults(items.length)
          setTotalPages(Math.max(1, Math.ceil(items.length / pageSize)))
          setContents(items.slice((page - 1) * pageSize, page * pageSize))
        } else {
          const discoverRes = await tmdbService.discover('movie', {
            page,
            sortBy: sortBy as any,
            genreId: selectedGenre || undefined,
            year: appliedYear
          })

          if (cancelled) return

          const blockedIds = new Set(blockedItems.map((b: BlacklistEntry) => b.tmdbId))
          const items = discoverRes.data.results.map((m: any) => ({
            id: m.id,
            title: m.title,
            mediaType: 'movie' as MediaType,
            subtitle: m.release_date ? `Filme • Lançamento: ${m.release_date.slice(0, 4)}` : 'Filme',
            posterPath: m.poster_path,
            voteAverage: m.vote_average,
            popularity: m.popularity,
            blocked: blockedIds.has(m.id)
          }))

          setContents(items)
          setTotalPages(discoverRes.data.total_pages)
          setTotalResults(discoverRes.data.total_results)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadContents()

    return () => { cancelled = true }
  }, [isManager, statusFilter, page, sortBy, selectedGenre, appliedYear])

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

  const handleToggleBlacklist = async (content: ContentItem) => {
    setSavingContentId(content.id)
    try {
      if (content.blocked) {
        await adminService.removeFromBlacklist(content.id)
        setBlacklist(prev => prev.filter(b => b.tmdbId !== content.id))
      } else {
        await adminService.addToBlacklist(content.id, content.mediaType)
        setBlacklist(prev => [...prev, { _id: String(content.id), tmdbId: content.id, mediaType: content.mediaType }])
      }
      setContents(prev => prev.map(c => c.id === content.id ? { ...c, blocked: !c.blocked } : c))
    } catch (err) {
      console.error(err)
    } finally {
      setSavingContentId(null)
    }
  }

  function formatNumber(value: number) {
    if (value > 1000) {
       return (value / 1000).toFixed(1) + 'M'
    }
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-[calc(100vh-5rem)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_28%)]" />

      <div className="relative max-w-screen-2xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-20">
        <AdminSubMenu items={ADMIN_SUB_MENU_ITEMS} />

        <section className="mt-6 md:mt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface-elevated">
              <PanelIcon />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Gestão de Conteúdos</h1>
          </div>
        </section>

        <div className="mt-8 flex flex-col lg:flex-row gap-8 items-start">
           {/* Sidebar Filters */}
           <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-8">
              <div>
                <p className="text-sm font-semibold text-white mb-6">{totalResults} resultados no total</p>
                
                {/* Ano de Lançamento */}
                <div className="mb-8">
                   <h3 className="text-sm font-medium text-text-secondary mb-3">Ano de Lançamento</h3>
                   <div className="flex items-center gap-2 mb-3">
                      <input 
                        type="number" 
                        className="w-full h-8 bg-surface-elevated border border-border rounded px-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" 
                        value={yearRange.min} 
                        onChange={e => setYearRange({...yearRange, min: +e.target.value})} 
                      />
                      <span className="text-text-muted">-</span>
                      <input 
                        type="number" 
                        className="w-full h-8 bg-surface-elevated border border-border rounded px-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" 
                        value={yearRange.max} 
                        onChange={e => setYearRange({...yearRange, max: +e.target.value})} 
                      />
                   </div>
                   <Button 
                     variant="secondary" 
                     size="sm" 
                     className="w-full border-[#333] text-text-secondary hover:text-white" 
                     onClick={() => {
                        setAppliedYear(yearRange.max)
                        setPage(1)
                     }}
                   >
                     Aplicar Filtro
                   </Button>
                </div>

                {/* Status */}
                <div className="mb-8">
                   <h3 className="text-sm font-medium text-text-secondary mb-3">Status do Catálogo</h3>
                   <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 cursor-pointer group">
                         <input 
                           type="radio" 
                           name="status" 
                           checked={statusFilter === 'available'} 
                           onChange={() => { setStatusFilter('available'); setPage(1); }} 
                           className="accent-primary w-4 h-4" 
                         />
                         <span className={clsx("text-sm transition-colors", statusFilter === 'available' ? "text-white" : "text-[#d5d4d4] group-hover:text-white")}>
                           Disponível no catálogo
                         </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                         <input 
                           type="radio" 
                           name="status" 
                           checked={statusFilter === 'blocked'} 
                           onChange={() => { setStatusFilter('blocked'); setPage(1); }} 
                           className="accent-primary w-4 h-4" 
                         />
                         <span className={clsx("text-sm transition-colors", statusFilter === 'blocked' ? "text-white" : "text-[#d5d4d4] group-hover:text-white")}>
                           Indisponível (Desativado)
                         </span>
                      </label>
                   </div>
                </div>

                {/* Gêneros */}
                <div>
                   <h3 className="text-sm font-medium text-text-secondary mb-3">Gêneros</h3>
                   <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => { setSelectedGenre(null); setPage(1); }} 
                        className={clsx("text-left text-sm transition-colors", selectedGenre === null ? "text-white font-medium" : "text-[#d5d4d4] hover:text-white")}
                      >
                        Todos
                      </button>
                      {genres.slice(0, 8).map(g => (
                         <button 
                           key={g.id} 
                           onClick={() => { setSelectedGenre(g.id); setPage(1); }} 
                           className={clsx("text-left text-sm transition-colors", selectedGenre === g.id ? "text-white font-medium" : "text-[#d5d4d4] hover:text-white")}
                         >
                           {g.name}
                         </button>
                      ))}
                   </div>
                </div>
              </div>
           </aside>

           {/* Main Grid */}
           <main className="flex-1 min-w-0">
              <div className="flex justify-end mb-6">
                 <div className="flex items-center gap-2 text-sm text-[#d5d4d4]">
                    <span>Ordenar por:</span>
                    <select 
                       className="bg-transparent text-[#3483FA] focus:outline-none cursor-pointer font-semibold" 
                       value={sortBy} 
                       onChange={e => { setSortBy(e.target.value); setPage(1); }}
                    >
                       <option value="popularity.desc" className="bg-surface-elevated text-white">Mais visualizados</option>
                       <option value="primary_release_date.desc" className="bg-surface-elevated text-white">Lançamento</option>
                       <option value="vote_average.desc" className="bg-surface-elevated text-white">Melhor Avaliação</option>
                    </select>
                 </div>
              </div>

              {loading ? (
                 <div className="flex justify-center py-20"><Spinner size="lg" /></div>
              ) : contents.length === 0 ? (
                 <p className="text-center text-text-secondary py-20">Nenhum conteúdo encontrado.</p>
              ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {contents.map(item => (
                       <article key={item.id} className="flex flex-col rounded bg-black border border-[#222] overflow-hidden group">
                          <div className="relative aspect-[2/3] w-full bg-[#111] border-b border-[#222]">
                             {item.posterPath ? (
                                <img src={tmdbImage(item.posterPath, 'w342')} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                             ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-text-muted uppercase tracking-widest">{item.mediaType}</div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          </div>
                          <div className="p-4 flex flex-col flex-1 gap-1.5 z-10 bg-[#111]">
                             <h3 className="font-semibold text-white text-sm md:text-base line-clamp-1">{item.title}</h3>
                             <p className="text-xs text-text-secondary line-clamp-1">{item.subtitle}</p>
                             
                             <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-[#3483FA] tracking-widest">★★★★★</span>
                                <span className="text-xs text-text-muted">{item.voteAverage.toFixed(1)}</span>
                             </div>
                             
                             <p className="text-xs text-[#d5d4d4] mb-3">{formatNumber(item.popularity * 1000)} acessos</p>

                             <div className="mt-auto pt-2 flex flex-col gap-3 border-t border-[#222]">
                                {item.blocked ? (
                                   <span className="text-xs text-text-secondary flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full border border-text-secondary"></span>
                                      Indisponível no catálogo
                                   </span>
                                ) : (
                                   <span className="text-xs text-[#00a650] flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-[#00a650]"></span>
                                      Disponível no catálogo
                                   </span>
                                )}
                                <Button
                                   variant="secondary"
                                   size="sm"
                                   loading={savingContentId === item.id}
                                   onClick={() => handleToggleBlacklist(item)}
                                   className={item.blocked 
                                      ? "w-full border-[#00a650] text-[#00a650] hover:bg-[#00a650]/10 bg-black font-medium" 
                                      : "w-full border-[#e50914] text-[#e50914] hover:bg-[#e50914]/10 bg-black font-medium"
                                   }
                                >
                                   {item.blocked ? 'Adicionar ao acervo' : 'Remover do acervo'}
                                </Button>
                             </div>
                          </div>
                       </article>
                    ))}
                 </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                 <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#222]">
                    <p className="text-sm text-text-secondary">Mostrando página {page} de {totalPages}</p>
                    <div className="flex items-center gap-2">
                       <button 
                         disabled={page === 1} 
                         onClick={() => setPage(p => p - 1)} 
                         className="px-3 h-8 border border-[#333] rounded text-sm text-[#d5d4d4] hover:text-white disabled:opacity-50 transition-colors"
                       >
                         &lt; Anterior
                       </button>
                       <span className="h-8 w-8 flex items-center justify-center border border-[#d5d4d4] bg-white/10 text-white text-sm rounded">
                         {page}
                       </span>
                       <button 
                         disabled={page === totalPages} 
                         onClick={() => setPage(p => p + 1)} 
                         className="px-3 h-8 border border-[#333] rounded text-sm text-[#d5d4d4] hover:text-white disabled:opacity-50 transition-colors"
                       >
                         Próxima &gt;
                       </button>
                    </div>
                 </div>
              )}
           </main>
        </div>
      </div>
    </div>
  )
}