import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ApresentacaoPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 px-4">
            <h1 className="font-display text-7xl text-primary tracking-wide">FLIX PLAYER</h1>
            <p className="font-sans text-text-secondary text-lg text-center max-w-md">
                Filmes, séries e muito mais. Sem limites.
            </p>
            <div className="flex gap-4">
                <Link href="/login">
                    <Button size="lg">Entrar</Button>
                </Link>
                <Link href="/register">
                    <Button size="lg" variant="secondary">Criar conta</Button>
                </Link>
            </div>
        </div>
    )
}