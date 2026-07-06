import { Suspense } from 'react'
import { Spinner } from '@/components/ui/Snipper'
import { BrowseResults } from './BrowseResults'

export default function BrowsePage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-20">
                    <Spinner size="lg" />
                </div>
            }
        >
            <BrowseResults />
        </Suspense>
    )
}
