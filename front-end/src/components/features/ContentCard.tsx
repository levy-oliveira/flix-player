'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { tmdbImage } from '@/services/tmdb'
import type { MediaType } from '@/types'

interface ContentCardProps {
  id: number
  title: string
  posterPath: string | null
  mediaType: MediaType
  voteAverage?: number
}

export function ContentCard({ id, title, posterPath, mediaType, voteAverage }: ContentCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imgSrc, setImgSrc] = useState(() => tmdbImage(posterPath, 'w342'))

  useEffect(() => {
    setImgSrc(tmdbImage(posterPath, 'w342'))
  }, [posterPath])

  return (
    <Link href={`/${mediaType}/${id}`} className="group block relative rounded overflow-hidden bg-surface-elevated w-full">
      <div className="relative aspect-[2/3] w-full">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-surface-elevated animate-pulse" />
        )}

        {posterPath ? (
          <Image
            src={imgSrc}
            alt={`Poster de ${title}`}
            fill
            unoptimized
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImgSrc('/placeholder_poster.png')
              setImageLoaded(true)
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-surface-elevated flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        )}

        {/* Gradiente permanente + intensifica no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-300" />

        {/* Rating */}
        {voteAverage !== undefined && voteAverage > 0 && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1">
            <svg className="w-3 h-3 text-star fill-star" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-white text-xs font-medium">{voteAverage.toFixed(1)}</span>
          </div>
        )}

        {/* Título sobre o gradiente */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-sans truncate font-medium text-shadow-card">
            {title}
          </p>
        </div>
      </div>
    </Link>
  )
}