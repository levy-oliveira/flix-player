'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { useFavorites, type FavoriteTitle } from '@/hooks/useFavorites'
import { ContentCard } from '@/components/features/ContentCard'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { Spinner } from '@/components/ui/Snipper'

// Figma: node 89:353 (Favoritos) — abas Tudo/Filmes/Séries, ordenação e grade com Remover

type Tab = 'all' | 'movie' | 'tv'

const TABS: { value: Tab; label: string }[] = [
    { value: 'all', label: 'Tudo' },
    { value: 'movie', label: 'Filmes' },
    { value: 'tv', label: 'Séries' },
]

const SORT_OPTIONS = [
    { value: 'recent', label: 'Adicionados recentemente' },
    { value: 'title', label: 'Título (A–Z)' },
    { value: 'year', label: 'Ano de lançamento' },
]

const sortFavorites = (items: FavoriteTitle[], sort: string) => {
    const sorted = [...items]
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
    else if (sort === 'year') sorted.sort((a, b) => Number(b.year ?? 0) - Number(a.year ?? 0))
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return sorted
}

const cardSubtitle = (item: FavoriteTitle) => {
    if (item.mediaType === 'tv') {
        return item.seasons ? `Série · ${item.seasons} temp.` : 'Série'
    }
    return item.year ? `Filme · ${item.year}` : 'Filme'
}

export default function FavoritesPage() {
    const { favorites, loading, error, remove } = useFavorites()
    const [tab, setTab] = useState<Tab>('all')
    const [sort, setSort] = useState('recent')

    const filtered = sortFavorites(
        tab === 'all' ? favorites : favorites.filter((item) => item.mediaType === tab),
        sort
    )

    return (
        <div className="px-4 md:px-8 py-6 max-w-screen-2xl mx-auto">
            {/* Cabeçalho da página + filtros */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-sans font-bold text-text-primary">
                        Meus Favoritos
                    </h1>
                    <p className="text-sm text-text-secondary font-sans mt-1">
                        {loading ? ' ' : `${favorites.length} ${favorites.length === 1 ? 'título salvo' : 'títulos salvos'}`}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 bg-surface-elevated border border-border rounded-full p-1">
                        {TABS.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setTab(value)}
                                className={clsx(
                                    'px-4 h-8 rounded-full text-sm font-sans font-medium transition-colors',
                                    tab === value
                                        ? 'bg-white text-black'
                                        : 'text-text-secondary hover:text-text-primary'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <FilterSelect
                        label="Ordenar"
                        value={sort}
                        onChange={setSort}
                        options={SORT_OPTIONS}
                        hideAll
                    />
                </div>
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            )}

            {!loading && error && (
                <p className="text-text-secondary py-20 text-center">
                    Não foi possível carregar seus favoritos. Tente novamente.
                </p>
            )}

            {!loading && !error && filtered.length === 0 && (
                <p className="text-text-secondary py-20 text-center">
                    {favorites.length === 0
                        ? 'Você ainda não salvou nenhum título. Explore o catálogo e adicione seus favoritos.'
                        : 'Nenhum título salvo nessa categoria.'}
                </p>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {filtered.map((item) => (
                        <div key={`${item.mediaType}-${item.tmdbId}`} className="relative group/fav">
                            <ContentCard
                                id={item.tmdbId}
                                title={item.title}
                                posterPath={item.posterPath}
                                mediaType={item.mediaType}
                                voteAverage={item.voteAverage}
                                subtitle={cardSubtitle(item)}
                            />
                            {/* Botão Remover sobre o card, visível no hover */}
                            <button
                                onClick={() => remove(item.tmdbId)}
                                title={`Remover ${item.title} dos favoritos`}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-4 h-9 rounded bg-black/80 backdrop-blur-sm border border-white/40 text-white text-sm font-sans font-medium opacity-0 group-hover/fav:opacity-100 focus-visible:opacity-100 hover:border-white transition-opacity"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                                Remover
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
