'use client'

import Image from 'next/image'
import Link from 'next/link'
import { tmdbImage } from '@/services/tmdb'
import type { MediaType } from '@/types'

interface MovieCardProps {
  id: number
  title: string
  posterPath: string | null
  mediaType: MediaType
  voteAverage?: number
}

export function MovieCard({ id, title, posterPath, mediaType, voteAverage }: MovieCardProps) {
  const href = `/${mediaType}/${id}`

  return (
    <Link href={href} className="group block relative rounded overflow-hidden bg-surface-elevated flex-shrink-0 w-[140px] md:w-[160px]">
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={tmdbImage(posterPath, 'w342')}
          alt={title}
          fill
          sizes="(max-width: 768px) 140px, 160px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Overlay no hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
      </div>

      {/* Rating badge */}
      {voteAverage !== undefined && voteAverage > 0 && (
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1">
          <svg className="w-3 h-3 text-star fill-star" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-white text-xs font-medium">{voteAverage.toFixed(1)}</span>
        </div>
      )}

      {/* Título abaixo */}
      <div className="p-2">
        <p className="text-text-secondary text-xs font-sans truncate group-hover:text-text-primary transition-colors">
          {title}
        </p>
      </div>
    </Link>
  )
}