import { NextRequest, NextResponse } from 'next/server'
import { getBlacklistIds, isBlacklisted } from '@/lib/blacklist'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_KEY = process.env.TMDB_API_KEY

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params
    const path = pathSegments.join('/')
    const searchParams = request.nextUrl.searchParams
    searchParams.set('api_key', TMDB_KEY!)
    searchParams.set('language', 'pt-BR')

    const url = `${TMDB_BASE}/${path}?${searchParams.toString()}`

    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) {
        return NextResponse.json({ error: 'TMDB error' }, { status: res.status })
    }

    const data = await res.json()
    const blacklistIds = await getBlacklistIds()

    // Caso 1: acesso direto a um título específico (/movie/123, /tv/456)
    // path tem formato "movie/123" ou "tv/456" — sem mais segmentos depois do id
    const directAccessMatch = path.match(/^(movie|tv)\/(\d+)$/)
    if (directAccessMatch) {
        const tmdbId = Number(directAccessMatch[2])
        if (isBlacklisted(tmdbId, blacklistIds)) {
            return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
        }
        return NextResponse.json(data)
    }

    // Caso 2: listagens e buscas que retornam um array `results`
    if (Array.isArray(data.results)) {
        data.results = data.results.filter(
            (item: { id: number }) => !isBlacklisted(item.id, blacklistIds)
        )
        return NextResponse.json(data)
    }

    // Caso 3: qualquer outro endpoint (gêneros, configurações, etc) — passa direto
    return NextResponse.json(data)
}