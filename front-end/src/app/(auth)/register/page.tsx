'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const PLANS = [
    { value: 'free', label: 'Gratuito', description: '3 títulos por dia' },
    { value: 'basic', label: 'Básico', description: '10 títulos por dia' },
    { value: 'pro', label: 'Pro', description: 'Sem restrições' },
]

export default function RegisterPage() {
    const { signUp } = useAuth()
    const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'free' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await signUp(form.name, form.email, form.password, form.plan)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao criar conta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                <h1 className="font-display text-5xl text-primary mb-2 tracking-wide">FLIX PLAYER</h1>
                <h2 className="font-display text-2xl text-text-primary mb-8">CRIAR CONTA</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Nome"
                        placeholder="Seu nome"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="seu@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Senha"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-text-secondary font-sans">Plano</label>
                        <div className="flex flex-col gap-2">
                            {PLANS.map((plan) => (
                                <label
                                    key={plan.value}
                                    className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${form.plan === plan.value
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border bg-surface-elevated hover:border-text-muted'
                                        }`}
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary font-sans">{plan.label}</p>
                                        <p className="text-xs text-text-muted font-sans">{plan.description}</p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="plan"
                                        value={plan.value}
                                        checked={form.plan === plan.value}
                                        onChange={(e) => setForm({ ...form, plan: e.target.value })}
                                        className="accent-primary"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-400 font-sans">{error}</p>}
                    <Button type="submit" size="lg" loading={loading} className="mt-2">
                        Criar conta
                    </Button>
                </form>
                <p className="mt-6 text-center text-text-secondary text-sm font-sans">
                    Já tem conta?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    )
}