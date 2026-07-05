// --- TMDB ---

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
}

export interface TMDBSeason {
  id: number
  name: string
  season_number: number
  episode_count: number
  air_date: string | null
  poster_path: string | null
}

export interface TMDBEpisode {
  id: number
  name: string
  episode_number: number
  season_number: number
  overview: string
  still_path: string | null
  air_date: string | null
  runtime: number | null
}

export interface TMDBShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
  number_of_seasons?: number
  number_of_episodes?: number
  seasons?: TMDBSeason[]
}

export type TMDBTitle = TMDBMovie | TMDBShow

// Resultado do /search/multi: cada item vem com media_type (inclui pessoas)
export type TMDBMultiResult =
  | (TMDBMovie & { media_type: 'movie' })
  | (TMDBShow & { media_type: 'tv' })
  | { media_type: 'person'; id: number; name: string }

export interface TMDBPaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface TMDBGenre {
  id: number
  name: string
}

// --- App ---

export type MediaType = 'movie' | 'tv'

export type Plan = 'free' | 'basic' | 'pro'

export type Role = 'user' | 'manager'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  plan: Plan
}

export interface AuthResponse {
  token: string
  user: User
}

export interface WatchLimit {
  used: number
  limit: number
  blocked: boolean
}

export interface Review {
  _id: string
  userId: string
  tmdbId: number
  mediaType: MediaType
  stars: number
  createdAt: string
}

export interface ReviewStats {
  average: number
  total: number
}