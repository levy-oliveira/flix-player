'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

type SubMenuItem = {
  label: string
  href: string
}

type AdminSubMenuProps = {
  items: SubMenuItem[]
}

export function AdminSubMenu({ items }: AdminSubMenuProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Submenu do painel"
      className="flex min-h-10 items-center gap-6 overflow-x-auto border border-[#222] px-4 py-2 md:gap-10 md:px-6 scrollbar-hide"
    >
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'whitespace-nowrap text-sm font-medium md:text-[18px] transition-colors',
              isActive ? 'text-white font-semibold' : 'text-[#d5d4d4] hover:text-white',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
