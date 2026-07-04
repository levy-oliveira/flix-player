import { Suspense } from 'react'
import { Spinner } from '@/components/ui/Snipper'
import { SearchResults } from './SearchResults'

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            }
        >
            <SearchResults />
        </Suspense>
    )
}
