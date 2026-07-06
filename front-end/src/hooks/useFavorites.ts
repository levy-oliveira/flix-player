'use client'

import { useCallback, useEffect, useState } from 'react'
import api from '@/services/api'
import { tmdbService } from '@/services/tmdb'
import type { MediaType } from '@/types'

// Registro salvo no back-end (coleção favorites)
interface FavoriteRecord {
    tmdbId: number
    mediaType: MediaType
    createdAt: string
}

// Favorito enriquecido com os detalhes da TMDB para exibição
export interface FavoriteTitle extends FavoriteRecord {
    title: string
    posterPath: string | null
    voteAverage: number
    year: string | null
    seasons: number | null
}

// Títulos removidos da TMDB (ou na blacklist) retornam 404 e são descartados
const enrich = async (record: FavoriteRecord): Promise<FavoriteTitle | null> => {
    try {
        if (record.mediaType === 'movie') {
            const { data } = await tmdbService.getMovieDetails(record.tmdbId)
            return {
                ...record,
                title: data.title,
                posterPath: data.poster_path,
                voteAverage: data.vote_average,
                year: data.release_date?.slice(0, 4) || null,
                seasons: null,
            }
        }
        const { data } = await tmdbService.getShowDetails(record.tmdbId)
        return {
            ...record,
            title: data.name,
            posterPath: data.poster_path,
            voteAverage: data.vote_average,
            year: data.first_air_date?.slice(0, 4) || null,
            seasons: data.number_of_seasons ?? null,
        }
    } catch {
        return null
    }
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoriteTitle[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        let cancelled = false

        api.get<{ data: { favorites: FavoriteRecord[] } }>('/favorites')
            .then(async ({ data }) => {
                const enriched = await Promise.all(data.data.favorites.map(enrich))
                if (cancelled) return
                setFavorites(enriched.filter((item): item is FavoriteTitle => item !== null))
                setError(false)
                setLoading(false)
            })
            .catch(() => {
                if (cancelled) return
                setError(true)
                setLoading(false)
            })

        return () => { cancelled = true }
    }, [refreshKey])

    const reload = useCallback(() => {
        setLoading(true)
        setError(false)
        setRefreshKey((key) => key + 1)
    }, [])

    // Remoção otimista: tira da lista na hora e desfaz se a API falhar
    const remove = useCallback(async (tmdbId: number) => {
        const previous = favorites
        setFavorites((current) => current.filter((item) => item.tmdbId !== tmdbId))
        try {
            await api.delete(`/favorites/${tmdbId}`)
        } catch {
            setFavorites(previous)
        }
    }, [favorites])

    const add = useCallback(async (tmdbId: number, mediaType: MediaType) => {
        await api.post('/favorites', { tmdbId, mediaType })
        const enriched = await enrich({ tmdbId, mediaType, createdAt: new Date().toISOString() })
        if (enriched) {
            setFavorites((current) => [enriched, ...current.filter((item) => item.tmdbId !== tmdbId)])
        }
    }, [])

    const isFavorite = useCallback(
        (tmdbId: number) => favorites.some((item) => item.tmdbId === tmdbId),
        [favorites]
    )

    return { favorites, loading, error, remove, add, isFavorite, reload }
}

// Versão leve para a página de conteúdo: só verifica/alterna um título,
// sem buscar os detalhes de toda a lista na TMDB
export function useFavoriteToggle(tmdbId: number, mediaType: MediaType) {
    const [favorite, setFavorite] = useState(false)
    const [pending, setPending] = useState(false)

    useEffect(() => {
        let cancelled = false
        api.get<{ data: { favorites: { tmdbId: number }[] } }>('/favorites')
            .then(({ data }) => {
                if (!cancelled) {
                    setFavorite(data.data.favorites.some((item) => item.tmdbId === tmdbId))
                }
            })
            .catch(() => { })
        return () => { cancelled = true }
    }, [tmdbId])

    const toggle = useCallback(async () => {
        setPending(true)
        try {
            if (favorite) await api.delete(`/favorites/${tmdbId}`)
            else await api.post('/favorites', { tmdbId, mediaType })
            setFavorite(!favorite)
        } catch {
            // mantém o estado atual se a API falhar
        } finally {
            setPending(false)
        }
    }, [favorite, tmdbId, mediaType])

    return { favorite, pending, toggle }
}
