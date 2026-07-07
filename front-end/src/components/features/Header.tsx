'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { clsx } from 'clsx'

const NAV_LINKS = [
  { href: '/browse', label: 'Gêneros' },
  { href: '/browse?filter=country', label: 'País' },
  { href: '/browse?type=movie', label: 'Filmes' },
  { href: '/browse?type=tv', label: 'Séries' },
]

export function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const currentHref = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('popstate', onStoreChange)
      return () => window.removeEventListener('popstate', onStoreChange)
    },
    () => `${window.location.pathname}${window.location.search}`,
    () => pathname,
  )

  const isManager = hydrated && user?.role === 'manager'
  const navLinks = isManager
    ? [...NAV_LINKS, { href: '/admin', label: 'Painel de Gerenciamento' }]
    : NAV_LINKS

  const actions = [
    { href: '/profile', title: 'Perfil', icon: <IconUser /> },
    { href: '/favorites', title: 'Favoritos', icon: <IconStar /> },
    ...(isManager ? [{ href: '/admin', title: 'Painel de Gerenciamento', icon: <IconUsers /> }] : []),
    { href: '/settings', title: 'Configurações', icon: <IconGear /> },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMenuOpen(false)
    }
  }

  const isActiveLink = (href: string) => currentHref === href || (href === '/admin' && pathname.startsWith('/admin'))

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-black/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center gap-6 px-4 md:px-8 lg:gap-9">
        <Link href="/" className="font-display text-2xl md:text-3xl text-primary tracking-wide flex-shrink-0">
          FLIX PLAYER
        </Link>

        <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'whitespace-nowrap font-sans text-lg xl:text-xl transition-colors',
                isActiveLink(href) ? 'text-white' : 'text-[#d5d4d4] hover:text-white',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-[350px] ml-auto">
          <div className="relative w-full">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full h-9 bg-surface-elevated border border-border rounded pl-4 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary font-sans"
            />
            <button
              type="submit"
              title="Buscar"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <IconSearch />
            </button>
          </div>
        </form>

        <div className="hidden lg:flex items-center gap-2">
          {actions.map(({ href, title, icon }) => (
            <Link
              key={href}
              href={href}
              title={title}
              className="flex h-9 w-9 items-center justify-center rounded border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
            >
              {icon}
            </Link>
          ))}
          <button
            onClick={signOut}
            title="Sair"
            className="flex h-9 w-9 items-center justify-center rounded border border-border text-text-secondary hover:text-primary hover:border-primary transition-colors"
          >
            <IconLogout />
          </button>
        </div>

        <button
          onClick={() => setMenuOpen((open) => !open)}
          title={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="lg:hidden ml-auto flex h-9 w-9 items-center justify-center rounded border border-border text-text-secondary hover:text-text-primary transition-colors"
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-4">
          <form onSubmit={handleSearch}>
            <div className="relative w-full">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-9 bg-surface-elevated border border-border rounded pl-4 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary font-sans"
              />
              <button
                type="submit"
                title="Buscar"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <IconSearch />
              </button>
            </div>
          </form>

          <nav className="flex flex-col gap-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'text-lg font-sans transition-colors',
                  isActiveLink(href) ? 'text-white' : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            {actions.map(({ href, title, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 text-text-secondary hover:text-text-primary transition-colors"
              >
                {icon}
                <span className="text-sm font-sans">{title}</span>
              </Link>
            ))}
            <button
              onClick={signOut}
              className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors"
            >
              <IconLogout />
              <span className="text-sm font-sans">Sair</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

function IconSearch() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconStar() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function IconGear() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
