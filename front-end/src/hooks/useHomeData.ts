'use client'

import { useEffect, useState } from 'react'
import { tmdbService } from '@/services/tmdb'
import type { TMDBMovie, TMDBShow } from '@/types'

interface HomeData {
    hero: TMDBMovie | null
    popular: TMDBMovie[]
    topRated: TMDBMovie[]
    nowPlaying: TMDBMovie[]
    loading: boolean
    error: boolean
}

export function useHomeData(): HomeData {
    const [data, setData] = useState<HomeData>({
        hero: null,
        popular: [],
        topRated: [],
        nowPlaying: [],
        loading: true,
        error: false,
    })

    useEffect(() => {
        let cancelled = false

        Promise.all([
            tmdbService.getTrendingMovies(),
            tmdbService.getPopularMovies(),
            tmdbService.getTopRatedMovies(),
            tmdbService.getNowPlayingMovies(),
        ])
            .then(([trending, popular, topRated, nowPlaying]) => {
                if (cancelled) return
                setData({
                    hero: trending.data.results[0] ?? null,
                    popular: popular.data.results,
                    topRated: topRated.data.results,
                    nowPlaying: nowPlaying.data.results,
                    loading: false,
                    error: false,
                })
            })
            .catch(() => {
                if (cancelled) return
                setData((prev) => ({ ...prev, loading: false, error: true }))
            })

        return () => {
            cancelled = true
        }
    }, [])

    return data
}