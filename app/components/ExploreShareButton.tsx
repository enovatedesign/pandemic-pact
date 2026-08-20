'use client'

import { useState } from 'react'
import { v4 } from 'uuid'
import { usePathname } from 'next/navigation'
import { ShareIcon, CheckIcon } from '@heroicons/react/outline'
import { cloneDeep, isEqual } from 'lodash'

import { ExploreShareKind, packExploreSharePayload } from '../helpers/share'
import { setKvDatabase } from '../helpers/kv'
import Button from './Button'

interface Props {
    kind: ExploreShareKind
    state: unknown
}

/**
 * Shares an Explore page's search state as a short `?share=` link, the same
 * mechanism the visualise sidebar uses. The state itself is too large for the
 * query string, so it goes to KV and the URL carries only its id.
 */
export default function ExploreShareButton({ kind, state }: Props) {
    const pathname = usePathname()

    const [sharedState, setSharedState] = useState(() => cloneDeep(state))
    const [sharedId, setSharedId] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)

    const shareUrl = async () => {
        // Nothing has changed since the last share, so hand back the same link
        // rather than filling the store with duplicates of one search.
        if (sharedId && isEqual(sharedState, state)) {
            return `?share=${sharedId}`
        }

        const id = v4()

        await setKvDatabase(id, packExploreSharePayload(kind, state))

        setSharedId(id)

        return `?share=${id}`
    }

    const handleShareClick = async () => {
        const fullUrl = `${window.location.origin}${pathname}${await shareUrl()}`

        if (window.innerWidth < 1024 && navigator.share) {
            try {
                await navigator.share({ title: 'Pandemic Pact', url: fullUrl })
            } catch (error) {
                console.error(
                    'Share functionality via "navigator.share" has failed.',
                    error,
                )
            }
        } else {
            navigator.clipboard.writeText(fullUrl)
        }

        setSharedState(cloneDeep(state))
        setIsCopied(true)

        setTimeout(() => setIsCopied(false), 3000)
    }

    if (isCopied) {
        return (
            <p className="flex items-center gap-1 px-3 py-1 text-sm uppercase text-secondary">
                URL copied to clipboard
                <CheckIcon className="w-5 h-5" aria-hidden="true" />
            </p>
        )
    }

    return (
        <Button
            size="xsmall"
            customClasses="flex items-center gap-1"
            onClick={handleShareClick}
        >
            Share Filters <ShareIcon className="w-5 h-5" aria-hidden="true" />
        </Button>
    )
}
