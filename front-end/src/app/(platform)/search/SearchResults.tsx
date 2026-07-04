'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { tmdbService } from '@/services/tmdb'
import { ContentCard } from '@/components/features/ContentCard'
import { Spinner } from '@/components/ui/Snipper'
import type { TMDBMultiResult } from '@/types'

// O /search/multi também retorna pessoas; aqui só interessam filmes e séries
type TitleResult = Exclude<TMDBMultiResult, { media_type: 'person' }>

interface SearchState {
    query: string
    results: TitleResult[]
    page: number
    totalPages: number
    error: boolean
}

const onlyTitles = (results: TMDBMultiResult[]): TitleResult[] =>
    results.filter((item): item is TitleResult => item.media_type !== 'person')

export function SearchResults() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q')?.trim() ?? ''

    const [state, setState] = useState<SearchState | null>(null)
    const [loadingMore, setLoadingMore] = useState(false)

    // Enquanto o estado carregado não corresponde à query da URL, está carregando
    const loading = !!query && state?.query !== query

    useEffect(() => {
        if (!query) return
        let cancelled = false

        tmdbService
            .search(query)
            .then(({ data }) => {
                if (cancelled) return
                setState({
                    query,
                    results: onlyTitles(data.results),
                    page: data.page,
                    totalPages: data.total_pages,
                    error: false,
                })
            })
            .catch(() => {
                if (cancelled) return
                setState({ query, results: [], page: 1, totalPages: 1, error: true })
            })

        return () => {
            cancelled = true
        }
    }, [query])

    const loadMore = async () => {
        if (!state) return
        setLoadingMore(true)
        try {
            const { data } = await tmdbService.search(state.query, state.page + 1)
            setState({
                ...state,
                results: [...state.results, ...onlyTitles(data.results)],
                page: data.page,
            })
        } catch {
            setState({ ...state, error: true })
        } finally {
            setLoadingMore(false)
        }
    }

    return (
        <div className="px-4 md:px-8 py-6 max-w-screen-2xl mx-auto">
            {query ? (
                <h1 className="text-xl md:text-2xl font-sans mb-6">
                    Resultados para <span className="text-primary">&ldquo;{query}&rdquo;</span>
                </h1>
            ) : (
                <p className="text-text-secondary py-20 text-center">
                    Digite algo na busca para encontrar filmes e séries.
                </p>
            )}

            {loading && (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            )}

            {!loading && state?.error && (
                <p className="text-text-secondary py-20 text-center">
                    Não foi possível carregar os resultados. Tente novamente.
                </p>
            )}

            {!loading && state && !state.error && state.results.length === 0 && (
                <p className="text-text-secondary py-20 text-center">
                    Nenhum resultado encontrado para &ldquo;{query}&rdquo;.
                </p>
            )}

            {!loading && state && !state.error && state.results.length > 0 && (
                <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {state.results.map((item) => (
                            <ContentCard
                                key={`${item.media_type}-${item.id}`}
                                id={item.id}
                                title={item.media_type === 'movie' ? item.title : item.name}
                                posterPath={item.poster_path}
                                mediaType={item.media_type}
                                voteAverage={item.vote_average}
                            />
                        ))}
                    </div>

                    {state.page < state.totalPages && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-6 py-2 rounded border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {loadingMore && <Spinner size="sm" />}
                                Carregar mais
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
