import axios from 'axios'
import type { TMDBMovie, TMDBShow, TMDBMultiResult, TMDBPaginatedResponse, TMDBGenre } from '@/types'

const tmdb = axios.create({
  baseURL: '/api/tmdb',
})

export const tmdbService = {
  // Filmes
  getTrendingMovies: (page = 1) =>
    tmdb.get<TMDBPaginatedResponse<TMDBMovie>>('/trending/movie/week', { params: { page } }),

  getPopularMovies: (page = 1) =>
    tmdb.get<TMDBPaginatedResponse<TMDBMovie>>('/movie/popular', { params: { page } }),

  getTopRatedMovies: (page = 1) =>
    tmdb.get<TMDBPaginatedResponse<TMDBMovie>>('/movie/top_rated', { params: { page } }),

  getNowPlayingMovies: (page = 1) =>
    tmdb.get<TMDBPaginatedResponse<TMDBMovie>>('/movie/now_playing', { params: { page } }),
  getMovieDetails: (id: number) =>
    tmdb.get<TMDBMovie>(`/movie/${id}`),

  getMovieCredits: (id: number) =>
    tmdb.get(`/movie/${id}/credits`),

  getSimilarMovies: (id: number) =>
    tmdb.get<TMDBPaginatedResponse<TMDBMovie>>(`/movie/${id}/similar`),

  // Séries
  getTrendingShows: (page = 1) =>
    tmdb.get<TMDBPaginatedResponse<TMDBShow>>('/trending/tv/week', { params: { page } }),

  getPopularShows: (page = 1) =>
    tmdb.get<TMDBPaginatedResponse<TMDBShow>>('/tv/popular', { params: { page } }),

  getShowDetails: (id: number) =>
    tmdb.get<TMDBShow>(`/tv/${id}`),

  getShowCredits: (id: number) =>
    tmdb.get(`/tv/${id}/credits`),

  getShowSeason: (id: number, season: number) =>
    tmdb.get(`/tv/${id}/season/${season}`),

  getSimilarShows: (id: number) =>
    tmdb.get<TMDBPaginatedResponse<TMDBShow>>(`/tv/${id}/similar`),

  // Busca e gêneros
  search: (query: string, page = 1) =>
    tmdb.get<TMDBPaginatedResponse<TMDBMultiResult>>('/search/multi', {
      params: { query, page },
    }),

  getMovieGenres: () =>
    tmdb.get<{ genres: TMDBGenre[] }>('/genre/movie/list'),

  getShowGenres: () =>
    tmdb.get<{ genres: TMDBGenre[] }>('/genre/tv/list'),

  getByGenre: (mediaType: 'movie' | 'tv', genreId: number, page = 1) =>
    tmdb.get<TMDBPaginatedResponse<TMDBMovie | TMDBShow>>(`/discover/${mediaType}`, {
      params: { with_genres: genreId, page },
    }),

  discover: (mediaType: 'movie' | 'tv', filters: DiscoverFilters = {}) => {
    const { genreId, year, country, sortBy = 'popularity.desc', page = 1 } = filters
    const params: Record<string, string | number> = { page, sort_by: sortBy }

    if (genreId) params.with_genres = genreId
    if (country) params.with_origin_country = country
    if (year) {
      // O parâmetro de ano difere entre filmes e séries na TMDB
      params[mediaType === 'movie' ? 'primary_release_year' : 'first_air_date_year'] = year
    }
    // Ao ordenar por nota, exige um mínimo de votos para evitar títulos obscuros
    if (sortBy === 'vote_average.desc') params['vote_count.gte'] = 200

    return tmdb.get<TMDBPaginatedResponse<TMDBMovie | TMDBShow>>(`/discover/${mediaType}`, { params })
  },
}

export type DiscoverSort = 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'first_air_date.desc'

export interface DiscoverFilters {
  genreId?: number
  year?: number
  country?: string
  sortBy?: DiscoverSort
  page?: number
}

// Helper para montar URL de imagem da TMDB
export const tmdbImage = (path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return '/placeholder_poster.png'
  return `https://image.tmdb.org/t/p/${size}${path}`
}