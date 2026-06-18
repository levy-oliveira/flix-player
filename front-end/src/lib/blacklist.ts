// Busca os IDs bloqueados no backend, com cache em memória para não bater
// no Express a cada requisição de catálogo. Roda no servidor Next.js.

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

let cache: { ids: number[]; fetchedAt: number } | null = null

export async function getBlacklistIds(): Promise<number[]> {
    const now = Date.now()

    if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
        return cache.ids
    }

    try {
        const res = await fetch(`${process.env.BACKEND_URL}/admin/blacklist/public`)

        if (!res.ok) {
            console.error('Falha ao buscar blacklist:', res.status)
            // Em caso de erro, retorna cache antigo se existir, senão lista vazia
            return cache?.ids ?? []
        }

        const data = await res.json()
        const ids: number[] = data.data?.ids ?? []

        cache = { ids, fetchedAt: now }
        return ids
    } catch (err) {
        console.error('Erro ao buscar blacklist:', err)
        return cache?.ids ?? []
    }
}

export function isBlacklisted(tmdbId: number, blacklistIds: number[]): boolean {
    return blacklistIds.includes(tmdbId)
}