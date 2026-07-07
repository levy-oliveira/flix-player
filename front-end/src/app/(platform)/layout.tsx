import { Header } from '@/components/features/Header'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-20">
                {children}
            </main>
        </div>
    )
}
