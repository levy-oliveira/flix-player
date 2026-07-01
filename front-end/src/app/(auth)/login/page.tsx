'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await signIn(email, password)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <h1 className="font-display text-5xl text-primary mb-2 tracking-wide">FLIX PLAYER</h1>
                <h2 className="font-display text-2xl text-text-primary mb-8">ENTRAR</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Senha"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="text-sm text-red-400 font-sans">{error}</p>}
                    <Button type="submit" size="lg" loading={loading} className="mt-2">
                        Entrar
                    </Button>
                </form>
                <p className="mt-6 text-center text-text-secondary text-sm font-sans">
                    Não tem conta?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    )
}