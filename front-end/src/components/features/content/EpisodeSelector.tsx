'use client'

import { useEffect, useState } from 'react'
import type { TMDBSeason, TMDBEpisode } from '@/types'
import { tmdbService } from '@/services/tmdb'

interface EpisodeSelectorProps {
    showId: number
    seasons: TMDBSeason[]
    activeSeason: number
    activeEpisode: number
    onSelect: (season: number, episode: number) => void
}

export function EpisodeSelector({
    showId,
    seasons,
    activeSeason,
    activeEpisode,
    onSelect,
}: EpisodeSelectorProps) {
    const [selectedSeason, setSelectedSeason] = useState(activeSeason)
    const [episodes, setEpisodes] = useState<TMDBEpisode[]>([])
    const [loadingEpisodes, setLoadingEpisodes] = useState(false)
    const [open, setOpen] = useState(false)

    const loadSeason = async (seasonNumber: number) => {
        setSelectedSeason(seasonNumber)
        setLoadingEpisodes(true)
        try {
            const { data } = await tmdbService.getShowSeason(showId, seasonNumber)
            setEpisodes(data.episodes ?? [])
        } catch {
            setEpisodes([])
        } finally {
            setLoadingEpisodes(false)
        }
    }

    const handleSeasonClick = (seasonNumber: number) => {
        if (seasonNumber === selectedSeason) {
            setOpen(prev => !prev)
        } else {
            setOpen(true)
            loadSeason(seasonNumber)
        }
    }

    // Carrega temporada 1 na montagem
    useEffect(() => {
        loadSeason(activeSeason)
    }, [])

    const currentSeason = seasons.find(s => s.season_number === selectedSeason)

    return (
        <div className="border border-border rounded">
            {/* Header do seletor */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-elevated transition-colors"
            >
                <span className="font-sans font-semibold text-text-primary text-sm uppercase tracking-wide">
                    {currentSeason?.name ?? `Temporada ${selectedSeason}`}
                </span>
                <svg
                    className={`w-4 h-4 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {/* Dropdown de temporadas */}
            {open && seasons.length > 1 && (
                <div className="border-t border-border px-4 py-2 flex gap-2 flex-wrap">
                    {seasons.map(s => (
                        <button
                            key={s.season_number}
                            onClick={() => handleSeasonClick(s.season_number)}
                            className={`px-3 py-1 rounded text-xs font-sans transition-colors ${s.season_number === selectedSeason
                                ? 'bg-primary text-white'
                                : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            T{s.season_number}
                        </button>
                    ))}
                </div>
            )}

            {/* Grade de episódios */}
            {open && (
                <div className="border-t border-border p-4">
                    {loadingEpisodes ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-8 rounded bg-surface-elevated animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {episodes.map(ep => (
                                <button
                                    key={ep.episode_number}
                                    onClick={() => {
                                        onSelect(selectedSeason, ep.episode_number)
                                        setOpen(false)
                                    }}
                                    className={`px-3 py-2 rounded text-xs font-sans text-left transition-colors truncate ${selectedSeason === activeSeason && ep.episode_number === activeEpisode
                                        ? 'bg-primary text-white'
                                        : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    EP {ep.episode_number}: {ep.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}