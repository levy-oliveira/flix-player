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
}

// Helper para montar URL de imagem da TMDB
export const tmdbImage = (path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return '/placeholder_poster.png'
  return `https://image.tmdb.org/t/p/${size}${path}`
}