'use client'

import { useHomeData } from '@/hooks/useHomeData'
import { HeroBanner } from '@/components/features/home/HeroBanner'
import { ContentCarousel } from '@/components/features/home/ContentCarousel'

export default function HomePage() {
    const { hero, popular, topRated, nowPlaying, loading, error } = useHomeData()

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-text-secondary font-sans">
                    Não foi possível carregar o conteúdo. Tente novamente.
                </p>
            </div>
        )
    }

    return (
        <div className="pb-8">
            {loading || !hero ? (
                <div className="w-full aspect-[21/9] md:aspect-[21/7] bg-surface-elevated animate-pulse" />
            ) : (
                <HeroBanner movie={hero} />
            )}

            <div className="mt-6 flex flex-col gap-2">
                <ContentCarousel
                    title="Mais Populares"
                    items={popular}
                    mediaType="movie"
                    loading={loading}
                />
                <ContentCarousel
                    title="Bem Avaliados"
                    items={topRated}
                    mediaType="movie"
                    loading={loading}
                />
                <ContentCarousel
                    title="Últimos Lançamentos"
                    items={nowPlaying}
                    mediaType="movie"
                    loading={loading}
                />
            </div>
        </div>
    )
}