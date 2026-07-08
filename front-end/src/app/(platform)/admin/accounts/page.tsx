'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { adminService } from '@/services/admin'
import type { AdminUserSummary } from '@/services/admin'
import type { Plan } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AdminSubMenu } from '@/components/features/admin/AdminSubMenu'
import { PanelIcon } from '@/components/features/admin/AdminDashboard'
import { clsx } from 'clsx'

const ITEMS_PER_PAGE = 7
const PLAN_ORDER: Plan[] = ['free', 'basic', 'pro']

const ADMIN_SUB_MENU_ITEMS = [
  { label: 'Painel', href: '/admin' },
  { label: 'Gestão de Contas', href: '/admin/accounts' },
  { label: 'Gestão de Conteúdos', href: '/admin/contents' },
  { label: 'Estatísticas', href: '/admin/statistics' },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getAvatarBg(role: string): string {
  return role === 'manager' ? '#E50914' : '#222222'
}

type PageNumbersProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PageNumbers({ currentPage, totalPages, onPageChange }: PageNumbersProps) {
  const pages: (number | '...')[] = []
  const showLeftEllipsis = currentPage > 3
  const showRightEllipsis = currentPage < totalPages - 2

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (showLeftEllipsis) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (showRightEllipsis) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <>
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`e-${idx}`} className="px-2 text-sm text-[#d5d4d4]">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={clsx(
              'h-8 w-8 flex items-center justify-center border text-sm transition-colors',
              currentPage === page
                ? 'border-[#d5d4d4] bg-white/10 text-white'
                : 'border-[#333] text-[#d5d4d4] hover:text-white hover:border-[#d5d4d4]',
            )}
          >
            {page}
          </button>
        ),
      )}
    </>
  )
}

export default function AdminAccountsPage() {
  const { user } = useAuth()
  const isManager = user?.role === 'manager'
  const [mounted, setMounted] = useState(false)

  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const selectedUser = users.find((item) => item._id === selectedUserId) ?? null

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users
    const term = search.trim().toLowerCase()
    return users.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item._id.includes(term),
    )
  }, [users, search])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  )

  const startItem = filteredUsers.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredUsers.length)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isManager) return

    let cancelled = false

    const loadUsers = async () => {
      try {
        const result = await adminService.getUsers()
        if (cancelled) return
        setUsers(result.data.data.users ?? [])
      } catch {
        if (!cancelled) {
          // error state removed intentionally in refactor
        }
      } finally {
        if (!cancelled) {
          // loading removed intentionally
        }
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [isManager])

  if (!mounted) {
    return <div className="min-h-[calc(100vh-5rem)] bg-black text-white" />
  }

  if (!isManager) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-10">
        <section className="border border-border bg-surface p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Acesso restrito</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white">Painel de Gerenciamento</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Esta área está disponível apenas para usuários com perfil de gerente.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded border border-border px-5 py-2.5 text-sm text-text-secondary hover:text-white hover:border-text-secondary transition-colors"
            >
              Voltar para a home
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const handleUpdateUserPlan = async (targetUser: AdminUserSummary, plan: Plan) => {
    setSavingUserId(targetUser._id)
    try {
      await adminService.updateUserPlan(targetUser._id, plan)
      setUsers((current) => current.map((item) => (item._id === targetUser._id ? { ...item, plan } : item)))
      if (selectedUserId === targetUser._id) {
        setSelectedUserId(targetUser._id)
      }
    } finally {
      setSavingUserId(null)
    }
  }

  const handleDeleteUser = async (targetUser: AdminUserSummary) => {
    const confirmed = window.confirm(`Remover a conta de ${targetUser.name}?`)
    if (!confirmed) return

    setSavingUserId(targetUser._id)
    try {
      await adminService.deleteUser(targetUser._id)
      setUsers((current) => current.filter((item) => item._id !== targetUser._id))
      setSelectedUserId((current) => (current === targetUser._id ? null : current))
    } finally {
      setSavingUserId(null)
    }
  }

  const renderPlanLabel = (plan: Plan) => {
    if (plan === 'free') return 'Sem plano ativo'
    if (plan === 'basic') return 'Plano ativo'
    return 'Plano premium ativo'
  }

  const renderUserLevel = (item: AdminUserSummary) => {
    if (item.role === 'manager') return 'Nível: 3 - Gerente'
    if (item.plan === 'free') return 'Nível: 1 - Sem plano ativo'
    return 'Nível: 2 - Plano ativo'
  }

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-[calc(100vh-5rem)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_28%)]" />

      <div className="relative max-w-screen-2xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-20">
        <AdminSubMenu items={ADMIN_SUB_MENU_ITEMS} />

        <section className="mt-6 md:mt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface-elevated">
              <PanelIcon />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Gestão de Contas</h1>
          </div>
        </section>

        <section className="mt-6 md:mt-10 border border-border bg-black/95 backdrop-blur-sm">
          <div className="border-b border-[#333] px-4 md:px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-semibold text-white">Gestão de Contas</h2>
              <span className="text-xs uppercase tracking-[0.25em] text-text-muted">
                {formatNumber(users.length)} registros
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <input
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar por ID ou Usuário..."
                  className="h-9 bg-surface-elevated border border-border rounded pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary w-64"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => alert('Abrir modal de criação de usuário')}
                className="border-[#d5d4d4] bg-transparent text-[#d5d4d4] hover:bg-white/5 hover:text-white"
              >
                + Adicionar Usuário
              </Button>
            </div>
          </div>

          <div className="px-4 md:px-6">
            {paginatedUsers.length > 0 ? (
              <div className="divide-y divide-[#222]">
                <div className="grid gap-4 px-0 py-3 lg:grid-cols-[120px_minmax(0,1fr)_230px_auto] text-xs uppercase tracking-[0.25em] text-text-muted">
                  <div>ID</div>
                  <div>Usuário</div>
                  <div>Nível de Acesso</div>
                  <div>Ações</div>
                </div>
                {paginatedUsers.map((item, index) => {
                  const isSelected = selectedUserId === item._id
                  const globalIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE + index + 1
                  return (
                    <article
                      key={item._id}
                      className={clsx(
                        'grid gap-4 px-0 py-4 lg:grid-cols-[120px_minmax(0,1fr)_230px_auto] lg:items-center',
                        isSelected ? 'bg-white/3' : '',
                      )}
                    >
                      <div className="text-xs uppercase tracking-[0.25em] text-text-muted">
                        ID: {String(globalIndex).padStart(7, '0')}
                      </div>

                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#333] text-[11px] font-semibold text-white"
                          style={{ backgroundColor: getAvatarBg(item.role) }}
                        >
                          {getInitials(item.name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-white">{item.name}</h3>
                          <p className="truncate text-sm text-text-secondary">{item.email}</p>
                        </div>
                      </div>

                      <div className="text-sm text-[#d5d4d4]">{renderUserLevel(item)}</div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          loading={savingUserId === item._id}
                          onClick={() => setSelectedUserId(item._id)}
                          className="border-[#d5d4d4] bg-transparent text-[#d5d4d4] hover:bg-white/5 hover:text-white"
                        >
                          Gerenciar
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          loading={savingUserId === item._id}
                          onClick={() => void handleDeleteUser(item)}
                          className="border-[#e50914] bg-transparent text-[#e50914] hover:bg-[#e50914]/10 hover:text-[#ffb4b7]"
                        >
                          Excluir
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="py-8 text-sm text-text-secondary">Nenhum usuário encontrado.</p>
            )}
          </div>

          <div className="border-t border-[#222] px-4 md:px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-text-secondary">
                Mostrando {startItem} a {endItem} de {formatNumber(filteredUsers.length)} contas
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={clsx(
                    'h-8 px-3 border text-sm transition-colors',
                    safeCurrentPage === 1
                      ? 'border-[#333] text-text-muted cursor-not-allowed'
                      : 'border-[#333] text-[#d5d4d4] hover:text-white hover:border-[#d5d4d4]',
                  )}
                >
                  &lt; Anterior
                </button>
                <PageNumbers
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                <button
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={clsx(
                    'h-8 px-3 border text-sm transition-colors',
                    safeCurrentPage === totalPages
                      ? 'border-[#333] text-text-muted cursor-not-allowed'
                      : 'border-[#333] text-[#d5d4d4] hover:text-white hover:border-[#d5d4d4]',
                  )}
                >
                  Próxima &gt;
                </button>
              </div>
            </div>
          </div>
        </section>

        {selectedUser && (
          <div className="mt-6 border border-border bg-surface px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Conta selecionada</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{selectedUser.name}</h3>
                <p className="text-sm text-text-secondary">{selectedUser.email}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="default">{selectedUser.role === 'manager' ? 'Gerente' : 'Usuário'}</Badge>
                <Badge variant="primary">{renderPlanLabel(selectedUser.plan)}</Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {PLAN_ORDER.map((plan) => (
                <Button
                  key={plan}
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={savingUserId === selectedUser._id}
                  onClick={() => void handleUpdateUserPlan(selectedUser, plan)}
                  className="border-[#d5d4d4] bg-transparent text-[#d5d4d4] hover:bg-white/5 hover:text-white"
                >
                  {plan.toUpperCase()}
                </Button>
              ))}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={savingUserId === selectedUser._id}
                onClick={() => void handleDeleteUser(selectedUser)}
                className="border-[#e50914] bg-transparent text-[#e50914] hover:bg-[#e50914]/10 hover:text-[#ffb4b7] sm:col-span-1"
              >
                Excluir conta
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}