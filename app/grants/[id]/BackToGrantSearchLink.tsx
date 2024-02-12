'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/solid'

export default function BackToGrantSearchLink() {
    return (
        <Suspense fallback={<ServerComponent />}>
            <ClientComponent />
        </Suspense>
    )
}

function ClientComponent() {
    const searchParams = useSearchParams()

    return <ServerComponent query={searchParams.get('q')} />
}

function ServerComponent({ query = null }: { query?: string | null }) {
    return (
        <Link
            href={query ? `/grants?q=${query}` : '/grants'}
            className="absolute right-12 lg:right-20 bg-secondary text-white rounded-full px-2 py-1 lg:px-4 lg:py-2 -translate-y-1/2 flex items-center gap-2 border-2 border-secondary hover:border-primary transition-colors duration-300"
        >
            <div className="aspect-square rounded-full border-2 border-white flex justify-center items-center">
                <ChevronLeftIcon className="w-4 h-4" />
            </div>

            <span className="uppercase tracking-wider font-medium">
                Grant search
            </span>
        </Link>
    )
}
