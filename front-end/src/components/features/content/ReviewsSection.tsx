'use client'

import { useReviews } from '@/hooks/useReviews'
import { StarRating } from '@/components/ui/StarRating'
import type { MediaType } from '@/types'

interface ReviewsSectionProps {
    tmdbId: number
    mediaType: MediaType
    tmdbVoteAverage: number
    tmdbVoteCount: number
}

export function ReviewsSection({
    tmdbId,
    mediaType,
    tmdbVoteAverage,
    tmdbVoteCount,
}: ReviewsSectionProps) {
    const { stats, userReview, loading, submitting, submitReview, removeReview } = useReviews(
        tmdbId,
        mediaType
    )

    return (
        <div className="flex flex-col sm:flex-row gap-6 mt-4">
            {/* Rating interno */}
            <div className="flex flex-col gap-2">
                <p className="text-text-muted text-xs font-sans uppercase tracking-wide">
                    Avaliação dos usuários
                </p>
                {loading ? (
                    <div className="h-6 w-32 bg-surface-elevated animate-pulse rounded" />
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <StarRating value={stats.average ? Math.round(stats.average) : null} readonly size="sm" />
                            <span className="text-text-primary text-sm font-sans font-medium">
                                {stats.average !== null ? stats.average.toFixed(1) : 'Sem avaliações'}
                            </span>
                            {stats.total > 0 && (
                                <span className="text-text-muted text-xs font-sans">
                                    ({stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'})
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Divisor */}
            <div className="hidden sm:block w-px bg-border" />

            {/* Rating TMDB */}
            <div className="flex flex-col gap-2">
                <p className="text-text-muted text-xs font-sans uppercase tracking-wide">
                    Avaliação TMDB
                </p>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-star fill-star" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-text-primary text-sm font-sans font-medium">
                        {tmdbVoteAverage.toFixed(1)}/10
                    </span>
                    <span className="text-text-muted text-xs font-sans">
                        ({tmdbVoteCount.toLocaleString()} votos)
                    </span>
                </div>
            </div>

            {/* Divisor */}
            <div className="hidden sm:block w-px bg-border" />

            {/* Avaliação do usuário */}
            <div className="flex flex-col gap-2">
                <p className="text-text-muted text-xs font-sans uppercase tracking-wide">
                    Sua avaliação
                </p>
                {loading ? (
                    <div className="h-6 w-32 bg-surface-elevated animate-pulse rounded" />
                ) : (
                    <StarRating
                        value={userReview?.stars ?? null}
                        onChange={submitReview}
                        onRemove={removeReview}
                        submitting={submitting}
                    />
                )}
            </div>
        </div>
    )
}