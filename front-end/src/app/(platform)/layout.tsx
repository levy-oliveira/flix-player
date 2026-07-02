import { Navbar } from '@/components/features/Navbar'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-14">
                {children}
            </main>
        </div>
    )
}