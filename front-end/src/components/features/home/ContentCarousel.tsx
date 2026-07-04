'use client'

import { useRef } from 'react'
import { ContentCard } from '@/components/features/ContentCard'
import type { TMDBMovie, MediaType } from '@/types'

interface ContentCarouselProps {
    title: string
    items: TMDBMovie[]
    mediaType: MediaType
    loading?: boolean
}

function CarouselSkeleton() {
    return (
        <div className="flex gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="flex-shrink-0 w-[140px] md:w-[160px] aspect-[2/3] rounded bg-surface-elevated animate-pulse"
                />
            ))}
        </div>
    )
}

export function ContentCarousel({ title, items, mediaType, loading }: ContentCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const amount = scrollRef.current.clientWidth * 0.75
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        })
    }

    return (
        <section className="px-4 md:px-8 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-2xl md:text-3xl text-text-primary">{title}</h2>

                {/* Botões de navegação — visíveis só em desktop */}
                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-1.5 rounded bg-surface-elevated border border-border hover:border-text-muted transition-colors text-text-secondary hover:text-text-primary"
                        aria-label="Anterior"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-1.5 rounded bg-surface-elevated border border-border hover:border-text-muted transition-colors text-text-secondary hover:text-text-primary"
                        aria-label="Próximo"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Lista */}
            {loading ? (
                <CarouselSkeleton />
            ) : (
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory md:snap-none"
                >
                    {items.map((item) => (
                        <div key={item.id} className="flex-shrink-0 w-[140px] md:w-[160px] snap-start">
                            <ContentCard
                                id={item.id}
                                title={item.title}
                                posterPath={item.poster_path}
                                mediaType={mediaType}
                                voteAverage={item.vote_average}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}