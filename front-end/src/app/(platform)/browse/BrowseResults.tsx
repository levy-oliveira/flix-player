'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { tmdbService, type DiscoverSort } from '@/services/tmdb'
import { ContentCard } from '@/components/features/ContentCard'
import { Spinner } from '@/components/ui/Snipper'
import { FilterSelect } from '@/components/ui/FilterSelect'
import type { TMDBGenre, TMDBMovie, TMDBShow, MediaType } from '@/types'

// Figma: node 89:217 (Seção) — breadcrumb, filtros e grade de títulos

const COUNTRIES = [
    { value: 'BR', label: 'Brasil' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'GB', label: 'Reino Unido' },
    { value: 'FR', label: 'França' },
    { value: 'DE', label: 'Alemanha' },
    { value: 'ES', label: 'Espanha' },
    { value: 'IT', label: 'Itália' },
    { value: 'JP', label: 'Japão' },
    { value: 'KR', label: 'Coreia do Sul' },
    { value: 'IN', label: 'Índia' },
    { value: 'MX', label: 'México' },
    { value: 'AR', label: 'Argentina' },
]

const SORT_OPTIONS = [
    { value: 'popularity', label: 'Popularidade' },
    { value: 'rating', label: 'Avaliação' },
    { value: 'release', label: 'Lançamento' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => CURRENT_YEAR - i)

const toDiscoverSort = (sort: string, type: MediaType): DiscoverSort => {
    if (sort === 'rating') return 'vote_average.desc'
    if (sort === 'release') return type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc'
    return 'popularity.desc'
}

interface ResultsState {
    filtersKey: string
    items: (TMDBMovie | TMDBShow)[]
    page: number
    totalPages: number
    totalResults: number
    error: boolean
}

export function BrowseResults() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // A URL é a fonte de verdade dos filtros (links do header apontam pra cá)
    const type: MediaType = searchParams.get('type') === 'tv' ? 'tv' : 'movie'
    const genreId = Number(searchParams.get('genre')) || undefined
    const year = Number(searchParams.get('year')) || undefined
    const country = searchParams.get('country') || undefined
    const sort = searchParams.get('sort') || 'popularity'

    const [genres, setGenres] = useState<TMDBGenre[]>([])
    const [state, setState] = useState<ResultsState | null>(null)
    const [loadingMore, setLoadingMore] = useState(false)

    // Enquanto o estado carregado não corresponde aos filtros da URL, está carregando
    const filtersKey = [type, genreId, year, country, sort].join('|')
    const results = state?.filtersKey === filtersKey ? state : null
    const error = results?.error ?? false

    const setParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        // Gêneros de filmes e séries têm ids diferentes na TMDB
        if (key === 'type') params.delete('genre')
        router.replace(`/browse?${params.toString()}`, { scroll: false })
    }

    useEffect(() => {
        let cancelled = false
        const request = type === 'movie' ? tmdbService.getMovieGenres() : tmdbService.getShowGenres()
        request.then(({ data }) => {
            if (!cancelled) setGenres(data.genres)
        }).catch(() => { })
        return () => { cancelled = true }
    }, [type])

    useEffect(() => {
        let cancelled = false

        tmdbService
            .discover(type, { genreId, year, country, sortBy: toDiscoverSort(sort, type) })
            .then(({ data }) => {
                if (cancelled) return
                setState({
                    filtersKey,
                    items: data.results,
                    page: data.page,
                    totalPages: data.total_pages,
                    totalResults: data.total_results,
                    error: false,
                })
            })
            .catch(() => {
                if (cancelled) return
                setState({ filtersKey, items: [], page: 1, totalPages: 1, totalResults: 0, error: true })
            })

        return () => { cancelled = true }
    }, [type, genreId, year, country, sort, filtersKey])

    const loadMore = async () => {
        if (!results) return
        setLoadingMore(true)
        try {
            const { data } = await tmdbService.discover(type, {
                genreId, year, country,
                sortBy: toDiscoverSort(sort, type),
                page: results.page + 1,
            })
            setState({
                ...results,
                items: [...results.items, ...data.results],
                page: data.page,
            })
        } catch {
            setState({ ...results, error: true })
        } finally {
            setLoadingMore(false)
        }
    }

    const genreName = genres.find((g) => g.id === genreId)?.name
    const typeLabel = type === 'movie' ? 'Filmes' : 'Séries'
    const title = genreName ?? typeLabel

    return (
        <div className="px-4 md:px-8 py-6 max-w-screen-2xl mx-auto">
            {/* Breadcrumb + cabeçalho da seção */}
            <nav className="flex items-center gap-2 text-sm text-text-secondary font-sans mb-2">
                <Link href="/" className="hover:text-text-primary transition-colors">Início</Link>
                <span className="text-text-muted">/</span>
                {genreName ? (
                    <>
                        <span>Gêneros</span>
                        <span className="text-text-muted">/</span>
                        <span className="text-text-primary">{genreName}</span>
                    </>
                ) : (
                    <span className="text-text-primary">{typeLabel}</span>
                )}
            </nav>
            <h1 className="text-3xl md:text-4xl font-sans font-bold text-text-primary">{title}</h1>
            <p className="text-sm text-text-secondary font-sans mt-1 mb-6">
                {results ? `${results.totalResults.toLocaleString('pt-BR')} títulos` : ' '}
            </p>

            {/* Barra de filtros */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <FilterSelect
                    label="Gênero"
                    value={genreId ? String(genreId) : ''}
                    onChange={(value) => setParam('genre', value)}
                    options={genres.map((g) => ({ value: String(g.id), label: g.name }))}
                />
                <FilterSelect
                    label="Ano"
                    value={year ? String(year) : ''}
                    onChange={(value) => setParam('year', value)}
                    options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
                />
                <FilterSelect
                    label="País"
                    value={country ?? ''}
                    onChange={(value) => setParam('country', value)}
                    options={COUNTRIES}
                />
                <FilterSelect
                    label="Tipo"
                    value={type}
                    onChange={(value) => setParam('type', value)}
                    options={[{ value: 'movie', label: 'Filmes' }, { value: 'tv', label: 'Séries' }]}
                    hideAll
                />
                <div className="ml-auto">
                    <FilterSelect
                        label="Ordenar por"
                        value={sort}
                        onChange={(value) => setParam('sort', value)}
                        options={SORT_OPTIONS}
                        hideAll
                    />
                </div>
            </div>

            {!results && !error && (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            )}

            {error && (
                <p className="text-text-secondary py-20 text-center">
                    Não foi possível carregar os títulos. Tente novamente.
                </p>
            )}

            {results && !error && results.items.length === 0 && (
                <p className="text-text-secondary py-20 text-center">
                    Nenhum título encontrado com esses filtros.
                </p>
            )}

            {results && !error && results.items.length > 0 && (
                <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {results.items.map((item) => (
                            <ContentCard
                                key={item.id}
                                id={item.id}
                                title={'title' in item ? item.title : item.name}
                                posterPath={item.poster_path}
                                mediaType={type}
                                voteAverage={item.vote_average}
                            />
                        ))}
                    </div>

                    {results.page < results.totalPages && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-6 py-2 rounded border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {loadingMore && <Spinner size="sm" />}
                                Carregar mais títulos
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
