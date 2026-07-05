import type { TMDBMovie, TMDBShow, MediaType } from '@/types'

export interface NormalizedContent {
    id: number
    title: string
    overview: string
    posterPath: string | null
    backdropPath: string | null
    releaseDate: string
    voteAverage: number
    voteCount: number
    genreIds: number[]
    mediaType: MediaType
    originalLanguage?: string
    numberOfSeasons?: number // só séries
}

export function normalizeMovie(movie: TMDBMovie): NormalizedContent {
    return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
        voteCount: movie.vote_count,
        genreIds: movie.genre_ids ?? [],
        mediaType: 'movie',
        originalLanguage: movie.original_language,
    }
}

export function normalizeShow(show: TMDBShow): NormalizedContent {
    return {
        id: show.id,
        title: show.name,
        overview: show.overview,
        posterPath: show.poster_path,
        backdropPath: show.backdrop_path,
        releaseDate: show.first_air_date,
        voteAverage: show.vote_average,
        voteCount: show.vote_count,
        genreIds: show.genre_ids ?? [],
        mediaType: 'tv',
        originalLanguage: (show as any).original_language,
        numberOfSeasons: (show as any).number_of_seasons,
    }
}