'use client'

import { useEffect, useState } from 'react'
import { tmdbService } from '@/services/tmdb'
import { normalizeMovie, normalizeShow, type NormalizedContent } from '@/lib/contentNormalizer'
import type { TMDBMovie, TMDBShow, TMDBSeason, MediaType } from '@/types'

interface Credits {
    directors: string[]
    cast: string[]
    production: string[]
}

interface ContentPageData {
    content: NormalizedContent | null
    credits: Credits | null
    similar: TMDBMovie[]
    seasons: TMDBSeason[]
    loadingContent: boolean
    loadingCredits: boolean
    loadingSimilar: boolean
    error: boolean
}

export function useContentData(id: number, type: MediaType): ContentPageData {
    const [data, setData] = useState<ContentPageData>({
        content: null,
        credits: null,
        similar: [],
        seasons: [],
        loadingContent: true,
        loadingCredits: true,
        loadingSimilar: true,
        error: false,
    })

    useEffect(() => {
        let cancelled = false

        // Chamada 1: detalhes — desbloqueia banner e info principal
        const detailsPromise = type === 'movie'
            ? tmdbService.getMovieDetails(id)
            : tmdbService.getShowDetails(id)

        detailsPromise
            .then(({ data: details }) => {
                if (cancelled) return
                const content = type === 'movie'
                    ? normalizeMovie(details as TMDBMovie)
                    : normalizeShow(details as TMDBShow)

                const seasons = type === 'tv'
                    ? ((details as TMDBShow).seasons ?? []).filter(s => s.season_number > 0)
                    : []

                setData(prev => ({
                    ...prev,
                    content,
                    seasons,
                    loadingContent: false,
                }))
            })
            .catch(() => {
                if (cancelled) return
                setData(prev => ({ ...prev, loadingContent: false, error: true }))
            })

        // Chamada 2: créditos — em paralelo
        const creditsPromise = type === 'movie'
            ? tmdbService.getMovieCredits(id)
            : tmdbService.getShowCredits(id)

        creditsPromise
            .then(({ data: credits }) => {
                if (cancelled) return
                const directors = type === 'movie'
                    ? credits.crew?.filter((c: any) => c.job === 'Director').map((c: any) => c.name) ?? []
                    : credits.crew?.filter((c: any) => c.job === 'Series Director' || c.department === 'Directing').slice(0, 3).map((c: any) => c.name) ?? []

                setData(prev => ({
                    ...prev,
                    credits: {
                        directors,
                        cast: credits.cast?.slice(0, 5).map((c: any) => c.name) ?? [],
                        production: [],
                    },
                    loadingCredits: false,
                }))
            })
            .catch(() => {
                if (cancelled) return
                setData(prev => ({ ...prev, loadingCredits: false }))
            })

        // Chamada 3: similares — em paralelo
        const similarPromise = type === 'movie'
            ? tmdbService.getSimilarMovies(id)
            : tmdbService.getSimilarShows(id)

        similarPromise
            .then(({ data: similar }) => {
                if (cancelled) return
                setData(prev => ({
                    ...prev,
                    similar: similar.results.slice(0, 12) as TMDBMovie[],
                    loadingSimilar: false,
                }))
            })
            .catch(() => {
                if (cancelled) return
                setData(prev => ({ ...prev, loadingSimilar: false }))
            })

        return () => { cancelled = true }
    }, [id, type])

    return data
}