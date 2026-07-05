'use client'

import { buildMovieUrl, buildTVUrl } from '@/lib/vidlink'
import type { MediaType } from '@/types'

interface VidLinkPlayerProps {
    id: number
    mediaType: MediaType
    season?: number
    episode?: number
}

export function VidLinkPlayer({ id, mediaType, season = 1, episode = 1 }: VidLinkPlayerProps) {
    const src = mediaType === 'movie'
        ? buildMovieUrl(id)
        : buildTVUrl(id, season, episode)

    return (
        <div className="relative w-full aspect-video bg-black">
            <iframe
                src={src}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
            />
        </div>
    )
}