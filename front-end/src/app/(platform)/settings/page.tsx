'use client'

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Snipper'
import type { Plan, User } from '@/types'

// Figma: node 89:357 (Configurações) — menu lateral + seções Conta,
// Idioma e legendas, Perfis e controle parental

const PLAN_INFO: Record<Plan, { label: string; price: string }> = {
    free: { label: 'Free · 3 títulos por mês', price: 'R$ 0,00' },
    basic: { label: 'Básico · 10 títulos por mês', price: 'R$ 29,90' },
    pro: { label: 'Pro · Títulos ilimitados', price: 'R$ 59,90' },
}

// Preferências sem suporte no back-end: persistidas no navegador
interface Preferences {
    appLanguage: string
    audioLanguage: string
    subtitles: string
    subtitleSize: string
    parentalRating: string
    pinLock: string
    profiles: string[]
}

const DEFAULT_PREFERENCES: Preferences = {
    appLanguage: 'pt-BR',
    audioLanguage: 'pt',
    subtitles: 'on',
    subtitleSize: 'medium',
    parentalRating: '16',
    pinLock: 'on',
    profiles: ['Ana', 'João', 'Infantil'],
}

const PREFERENCES_KEY = 'flix_settings'

const loadPreferences = (): Preferences => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES
    try {
        const stored = localStorage.getItem(PREFERENCES_KEY)
        return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES
    } catch {
        return DEFAULT_PREFERENCES
    }
}

const SECTIONS = [
    { id: 'conta', label: 'Conta' },
    { id: 'idioma', label: 'Idioma e legendas' },
    { id: 'perfis', label: 'Perfis e controle parental' },
]

const nextBillingDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function SettingsPage() {
    const { signOut } = useAuth()
    const updateUser = useAuthStore((state) => state.updateUser)

    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
    const savedPreferences = useRef<Preferences>(DEFAULT_PREFERENCES)
    const [feedback, setFeedback] = useState('')

    const [activeSection, setActiveSection] = useState('conta')

    // Modais
    const [nameModalOpen, setNameModalOpen] = useState(false)
    const [passwordModalOpen, setPasswordModalOpen] = useState(false)
    const [profileModalOpen, setProfileModalOpen] = useState(false)

    useEffect(() => {
        // Lido em efeito (e não no initializer) para não divergir do HTML pré-renderizado
        const stored = loadPreferences()
        savedPreferences.current = stored
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreferences(stored)

        let cancelled = false
        api.get<{ data: { user: User } }>('/users/me')
            .then(({ data }) => {
                if (!cancelled) setProfile(data.data.user)
            })
            .catch(() => { })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [])

    const setPreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
        setPreferences((current) => ({ ...current, [key]: value }))
        setFeedback('')
    }

    const savePreferences = () => {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
        savedPreferences.current = preferences
        setFeedback('Alterações salvas.')
    }

    const cancelChanges = () => {
        setPreferences(savedPreferences.current)
        setFeedback('')
    }

    const scrollTo = (id: string) => {
        setActiveSection(id)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const planInfo = profile ? PLAN_INFO[profile.plan] : null

    return (
        <div className="px-4 md:px-8 py-6 max-w-screen-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-sans font-bold text-text-primary mb-8">
                Configurações
            </h1>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Menu lateral */}
                <aside className="w-full lg:w-64 lg:sticky lg:top-24 bg-surface border border-border rounded-lg p-2 flex-shrink-0">
                    <nav className="flex flex-col">
                        {SECTIONS.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => scrollTo(id)}
                                className={clsx(
                                    'relative text-left px-4 py-3 rounded text-sm font-sans transition-colors',
                                    activeSection === id
                                        ? 'bg-surface-elevated text-text-primary font-semibold'
                                        : 'text-text-secondary hover:text-text-primary'
                                )}
                            >
                                {activeSection === id && (
                                    <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded" />
                                )}
                                {label}
                            </button>
                        ))}
                        <div className="border-t border-border my-2" />
                        <button
                            onClick={signOut}
                            className="text-left px-4 py-3 rounded text-sm font-sans text-text-secondary hover:text-primary transition-colors"
                        >
                            Sair da conta
                        </button>
                    </nav>
                </aside>

                {/* Seções */}
                <div className="flex-1 w-full flex flex-col gap-6 scroll-mt-24">
                    {/* Conta */}
                    <section id="conta" className="bg-surface border border-border rounded-lg p-6 scroll-mt-24">
                        <h2 className="text-lg font-sans font-semibold text-text-primary mb-2">Conta</h2>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Spinner size="md" />
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                <SettingRow label="Nome" value={profile?.name ?? '—'}>
                                    <Button variant="secondary" size="sm" onClick={() => setNameModalOpen(true)}>
                                        Alterar
                                    </Button>
                                </SettingRow>
                                <SettingRow label="E-mail" value={profile?.email ?? '—'} />
                                <SettingRow label="Senha" value="••••••••••">
                                    <Button variant="secondary" size="sm" onClick={() => setPasswordModalOpen(true)}>
                                        Alterar senha
                                    </Button>
                                </SettingRow>
                                <SettingRow label="Plano" value={planInfo?.label ?? '—'} />
                                <SettingRow
                                    label="Próxima cobrança"
                                    value={
                                        profile?.plan === 'free' || !planInfo
                                            ? 'Sem cobrança no plano Free'
                                            : `${nextBillingDate()} · ${planInfo.price}`
                                    }
                                />
                            </div>
                        )}
                    </section>

                    {/* Idioma e legendas */}
                    <section id="idioma" className="bg-surface border border-border rounded-lg p-6 scroll-mt-24">
                        <h2 className="text-lg font-sans font-semibold text-text-primary mb-2">Idioma e legendas</h2>
                        <div className="divide-y divide-border">
                            <PreferenceRow label="Idioma do aplicativo">
                                <PreferenceSelect
                                    value={preferences.appLanguage}
                                    onChange={(value) => setPreference('appLanguage', value)}
                                    options={[
                                        { value: 'pt-BR', label: 'Português (Brasil)' },
                                        { value: 'en-US', label: 'English (US)' },
                                        { value: 'es-ES', label: 'Español' },
                                    ]}
                                />
                            </PreferenceRow>
                            <PreferenceRow label="Idioma de áudio padrão">
                                <PreferenceSelect
                                    value={preferences.audioLanguage}
                                    onChange={(value) => setPreference('audioLanguage', value)}
                                    options={[
                                        { value: 'pt', label: 'Português' },
                                        { value: 'en', label: 'Inglês' },
                                        { value: 'es', label: 'Espanhol' },
                                        { value: 'original', label: 'Idioma original' },
                                    ]}
                                />
                            </PreferenceRow>
                            <PreferenceRow label="Legendas">
                                <PreferenceSelect
                                    value={preferences.subtitles}
                                    onChange={(value) => setPreference('subtitles', value)}
                                    options={[
                                        { value: 'on', label: 'Ativadas' },
                                        { value: 'off', label: 'Desativadas' },
                                    ]}
                                />
                            </PreferenceRow>
                            <PreferenceRow label="Tamanho da legenda">
                                <PreferenceSelect
                                    value={preferences.subtitleSize}
                                    onChange={(value) => setPreference('subtitleSize', value)}
                                    options={[
                                        { value: 'small', label: 'Pequeno' },
                                        { value: 'medium', label: 'Médio' },
                                        { value: 'large', label: 'Grande' },
                                    ]}
                                />
                            </PreferenceRow>
                        </div>
                    </section>

                    {/* Perfis e controle parental */}
                    <section id="perfis" className="bg-surface border border-border rounded-lg p-6 scroll-mt-24">
                        <h2 className="text-lg font-sans font-semibold text-text-primary mb-4">
                            Perfis e controle parental
                        </h2>

                        <div className="flex flex-wrap gap-4 mb-6">
                            {preferences.profiles.map((name, index) => (
                                <div key={`${name}-${index}`} className="flex flex-col items-center gap-1.5 group">
                                    <div className="relative w-16 h-16 rounded bg-surface-elevated border border-border flex items-center justify-center text-2xl font-sans font-bold text-text-primary">
                                        {name.charAt(0).toUpperCase()}
                                        {preferences.profiles.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    setPreference('profiles', preferences.profiles.filter((_, i) => i !== index))
                                                }
                                                title={`Remover perfil ${name}`}
                                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-surface-elevated border border-border text-text-secondary hover:text-primary hover:border-primary items-center justify-center hidden group-hover:flex"
                                            >
                                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-xs font-sans text-text-secondary">{name}</span>
                                </div>
                            ))}
                            <button
                                onClick={() => setProfileModalOpen(true)}
                                className="flex flex-col items-center gap-1.5"
                                title="Adicionar perfil"
                            >
                                <div className="w-16 h-16 rounded border border-dashed border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-text-secondary transition-colors">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                </div>
                                <span className="text-xs font-sans text-text-muted">Adicionar</span>
                            </button>
                        </div>

                        <div className="divide-y divide-border">
                            <PreferenceRow label="Classificação parental">
                                <PreferenceSelect
                                    value={preferences.parentalRating}
                                    onChange={(value) => setPreference('parentalRating', value)}
                                    options={[
                                        { value: 'L', label: 'Livre' },
                                        { value: '10', label: '10 anos' },
                                        { value: '12', label: '12 anos' },
                                        { value: '14', label: '14 anos' },
                                        { value: '16', label: '16 anos' },
                                        { value: '18', label: '18 anos' },
                                    ]}
                                />
                            </PreferenceRow>
                            <PreferenceRow label="Bloqueio por PIN">
                                <PreferenceSelect
                                    value={preferences.pinLock}
                                    onChange={(value) => setPreference('pinLock', value)}
                                    options={[
                                        { value: 'on', label: 'Ativado' },
                                        { value: 'off', label: 'Desativado' },
                                    ]}
                                />
                            </PreferenceRow>
                        </div>
                    </section>

                    {/* Ações */}
                    <div className="flex items-center justify-end gap-3">
                        {feedback && <span className="text-sm font-sans text-text-secondary mr-auto">{feedback}</span>}
                        <Button variant="secondary" onClick={cancelChanges}>Cancelar</Button>
                        <Button onClick={savePreferences}>Salvar alterações</Button>
                    </div>
                </div>
            </div>

            {/* key força remontagem ao abrir, zerando o estado do formulário */}
            <ChangeNameModal
                key={`name-${nameModalOpen}`}
                open={nameModalOpen}
                onClose={() => setNameModalOpen(false)}
                currentName={profile?.name ?? ''}
                onSaved={(name) => {
                    setProfile((current) => (current ? { ...current, name } : current))
                    updateUser({ name })
                }}
            />
            <ChangePasswordModal
                key={`password-${passwordModalOpen}`}
                open={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
            />
            <AddProfileModal
                key={`profile-${profileModalOpen}`}
                open={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                onAdd={(name) => setPreference('profiles', [...preferences.profiles, name])}
            />
        </div>
    )
}

function SettingRow({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
                <p className="text-xs font-sans uppercase tracking-wide text-text-muted mb-1">{label}</p>
                <p className="text-sm font-sans text-text-primary truncate">{value}</p>
            </div>
            {children}
        </div>
    )
}

function PreferenceRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-4">
            <p className="text-sm font-sans font-medium text-text-primary">{label}</p>
            {children}
        </div>
    )
}

function PreferenceSelect({
    value,
    onChange,
    options,
}: {
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 px-3 bg-surface-elevated border border-border rounded text-sm font-sans font-semibold text-text-primary cursor-pointer hover:border-text-muted transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value} className="bg-surface-elevated">
                    {option.label}
                </option>
            ))}
        </select>
    )
}

function ChangeNameModal({
    open,
    onClose,
    currentName,
    onSaved,
}: {
    open: boolean
    onClose: () => void
    currentName: string
    onSaved: (name: string) => void
}) {
    const [name, setName] = useState(currentName)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const save = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('O nome não pode ser vazio.')
            return
        }
        setSaving(true)
        setError('')
        try {
            await api.patch('/users/me', { name: name.trim() })
            onSaved(name.trim())
            onClose()
        } catch {
            setError('Não foi possível atualizar o nome. Tente novamente.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="Alterar nome">
            <form onSubmit={save} className="flex flex-col gap-4">
                <Input
                    label="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={error}
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={saving}>Salvar</Button>
                </div>
            </form>
        </Modal>
    )
}

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const save = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.')
            return
        }
        if (password !== confirm) {
            setError('As senhas não coincidem.')
            return
        }
        setSaving(true)
        setError('')
        try {
            await api.patch('/users/me', { password })
            onClose()
        } catch {
            setError('Não foi possível alterar a senha. Tente novamente.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="Alterar senha">
            <form onSubmit={save} className="flex flex-col gap-4">
                <Input
                    label="Nova senha"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                />
                <Input
                    label="Confirmar nova senha"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    error={error}
                />
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" loading={saving}>Salvar</Button>
                </div>
            </form>
        </Modal>
    )
}

function AddProfileModal({
    open,
    onClose,
    onAdd,
}: {
    open: boolean
    onClose: () => void
    onAdd: (name: string) => void
}) {
    const [name, setName] = useState('')
    const [error, setError] = useState('')

    const save = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Digite um nome para o perfil.')
            return
        }
        onAdd(name.trim())
        onClose()
    }

    return (
        <Modal open={open} onClose={onClose} title="Adicionar perfil">
            <form onSubmit={save} className="flex flex-col gap-4">
                <Input
                    label="Nome do perfil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={error}
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Adicionar</Button>
                </div>
            </form>
        </Modal>
    )
}
