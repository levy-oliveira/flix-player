'use client'

import Image from 'next/image'
import Link from 'next/link'
import { tmdbImage } from '@/services/tmdb'
import type { TMDBMovie } from '@/types'

interface HeroBannerProps {
    movie: TMDBMovie
}

export function HeroBanner({ movie }: HeroBannerProps) {
    return (
        <div className="relative w-full aspect-[21/9] md:aspect-[21/7] overflow-hidden">
            {/* Backdrop */}
            <Image
                src={tmdbImage(movie.backdrop_path, 'original')}
                alt={movie.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />

            {/* Gradientes */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

            {/* Conteúdo */}
            <div className="absolute inset-0 flex flex-col justify-end pb-8 px-4 md:px-8 max-w-2xl">
                <h1 className="font-display text-4xl md:text-6xl text-white mb-3 leading-none">
                    {movie.title}
                </h1>

                <p className="text-text-secondary text-sm md:text-base font-sans line-clamp-2 mb-4">
                    {movie.overview}
                </p>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/movie/${movie.id}`}
                        className="bg-primary hover:bg-primary-hover text-white font-sans font-semibold px-6 py-2.5 rounded transition-colors text-sm"
                    >
                        Assistir
                    </Link>
                    <Link
                        href={`/movie/${movie.id}`}
                        className="bg-white/20 hover:bg-white/30 text-white font-sans font-semibold px-6 py-2.5 rounded transition-colors text-sm backdrop-blur-sm"
                    >
                        Detalhes
                    </Link>
                </div>
            </div>
        </div>
    )
}