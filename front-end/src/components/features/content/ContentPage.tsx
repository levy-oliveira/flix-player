'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useContentData } from '@/hooks/useContentData'
import { VidLinkPlayer } from './VidLinkPlayer'
import { EpisodeSelector } from './EpisodeSelector'
import { ContentCarousel } from '@/components/features/home/ContentCarousel'
import { tmdbImage } from '@/services/tmdb'
import type { MediaType } from '@/types'

interface ContentPageProps {
    id: number
    type: MediaType
}

function InfoSkeleton() {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-6 w-48 bg-surface-elevated rounded" />
            <div className="h-4 w-full bg-surface-elevated rounded" />
            <div className="h-4 w-3/4 bg-surface-elevated rounded" />
        </div>
    )
}

export function ContentPage({ id, type }: ContentPageProps) {
    const { content, credits, similar, seasons, loadingContent, loadingCredits, loadingSimilar, error } = useContentData(id, type)
    const [season, setSeason] = useState(1)
    const [episode, setEpisode] = useState(1)
    const [showPlayer, setShowPlayer] = useState(false)

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-text-secondary font-sans">Conteúdo não encontrado.</p>
            </div>
        )
    }

    return (
        <div className="pb-12">
            {/* Banner ou Player */}
            <div className={`relative w-full overflow-hidden bg-black ${showPlayer ? 'aspect-video' : 'aspect-[21/9] md:aspect-[21/7]'}`}>
                {showPlayer ? (
                    <VidLinkPlayer id={id} mediaType={type} season={season} episode={episode} />
                ) : (
                    <>
                        {content?.backdropPath && (
                            <Image
                                src={tmdbImage(content.backdropPath, 'original')}
                                alt={content.title}
                                fill
                                priority
                                sizes="100vw"
                                className="object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                        {/* Botão Assistir sobre o banner */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={() => setShowPlayer(true)}
                                className="bg-primary hover:bg-primary-hover text-white font-sans font-semibold px-8 py-3 rounded-full transition-colors flex items-center gap-2 text-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Assistir
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="px-4 md:px-8 mt-6">
                {/* Seletor de episódios — só séries */}
                {type === 'tv' && seasons.length > 0 && (
                    <div className="mb-6">
                        <EpisodeSelector
                            showId={id}
                            seasons={seasons}
                            activeSeason={season}
                            activeEpisode={episode}
                            onSelect={(s, e) => {
                                setSeason(s)
                                setEpisode(e)
                                setShowPlayer(true)
                            }}
                        />
                    </div>
                )}

                {/* Info do conteúdo */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Poster */}
                    {content?.posterPath && (
                        <div className="flex-shrink-0 w-32 md:w-48">
                            <div className="relative aspect-[2/3] w-full rounded overflow-hidden">
                                <Image
                                    src={tmdbImage(content.posterPath, 'w342')}
                                    alt={content.title}
                                    fill
                                    sizes="(max-width: 768px) 128px, 192px"
                                    className="object-cover"
                                />
                            </div>

                            {/* Rating interno placeholder */}
                            <div className="mt-2 flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <svg key={star} className="w-4 h-4 text-star fill-star" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                                <span className="text-text-muted text-xs ml-1 font-sans">
                                    {content?.voteAverage.toFixed(1)}/10
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Detalhes */}
                    <div className="flex-1">
                        {loadingContent ? (
                            <InfoSkeleton />
                        ) : content ? (
                            <>
                                {/* Badges */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="px-2 py-0.5 border border-border text-text-muted text-xs font-sans rounded">
                                        {type === 'movie' ? 'Filme' : 'Série'}
                                    </span>
                                    <span className="px-2 py-0.5 border border-border text-text-muted text-xs font-sans rounded">
                                        {content.releaseDate?.slice(0, 4)}
                                    </span>
                                </div>

                                <h1 className="font-display text-3xl md:text-5xl text-text-primary mb-3">
                                    {content.title}
                                </h1>

                                <p className="text-text-secondary font-sans text-sm md:text-base leading-relaxed mb-6">
                                    {content.overview}
                                </p>

                                {/* Grid de metadados */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {loadingCredits ? (
                                        <>
                                            <div className="h-12 bg-surface-elevated rounded animate-pulse" />
                                            <div className="h-12 bg-surface-elevated rounded animate-pulse" />
                                            <div className="h-12 bg-surface-elevated rounded animate-pulse" />
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="text-text-muted text-xs font-sans uppercase tracking-wide mb-1">País</p>
                                                <p className="text-text-primary text-sm font-sans">
                                                    {content.originalLanguage?.toUpperCase() ?? '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-text-muted text-xs font-sans uppercase tracking-wide mb-1">Lançamento</p>
                                                <p className="text-text-primary text-sm font-sans">{content.releaseDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-text-muted text-xs font-sans uppercase tracking-wide mb-1">Avaliação TMDB</p>
                                                <p className="text-text-primary text-sm font-sans">
                                                    {content.voteAverage.toFixed(1)}/10 ({content.voteCount} votos)
                                                </p>
                                            </div>
                                            {credits?.directors && credits.directors.length > 0 && (
                                                <div>
                                                    <p className="text-text-muted text-xs font-sans uppercase tracking-wide mb-1">Direção</p>
                                                    <p className="text-text-primary text-sm font-sans">{credits.directors.join(', ')}</p>
                                                </div>
                                            )}
                                            {credits?.cast && credits.cast.length > 0 && (
                                                <div>
                                                    <p className="text-text-muted text-xs font-sans uppercase tracking-wide mb-1">Elenco</p>
                                                    <p className="text-text-primary text-sm font-sans">{credits.cast.join(', ')}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>

                {/* Você também pode gostar */}
                {!loadingSimilar && similar.length > 0 && (
                    <div className="mt-10">
                        <ContentCarousel
                            title="Você também pode gostar"
                            items={similar}
                            mediaType={type}
                        />
                    </div>
                )}
                {loadingSimilar && (
                    <div className="mt-10">
                        <ContentCarousel title="Você também pode gostar" items={[]} mediaType={type} loading />
                    </div>
                )}
            </div>
        </div>
    )
}