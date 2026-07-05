const VIDLINK_BASE = 'https://vidlink.pro'

export const buildMovieUrl = (tmdbId: number): string =>
    `${VIDLINK_BASE}/movie/${tmdbId}`

export const buildTVUrl = (tmdbId: number, season: number, episode: number): string =>
    `${VIDLINK_BASE}/tv/${tmdbId}/${season}/${episode}`