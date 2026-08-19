"use client"

import { useContext, useMemo, useState } from "react"
import { v4 } from 'uuid'
import { useRouter, usePathname } from "next/navigation"
import { ShareIcon, CheckIcon } from "@heroicons/react/outline"
import { isEqual, cloneDeep } from "lodash"

import { GlobalFilterContext, SidebarStateContext } from "../helpers/filters"
import { ShareableStateContext, packSharePayload } from "../helpers/share"
import { setKvDatabase } from "../helpers/kv"

const ShareButton = ({
    colourClasses,
    iconClasses
}: {
    colourClasses: string,
    iconClasses: string
}) => {
    const router = useRouter()
    const pathname = usePathname()

    const { filters } = useContext(GlobalFilterContext)
    const { shareableState } = useContext(ShareableStateContext)
    const { sidebarOpen } = useContext(SidebarStateContext)

    const [sharedState, setSharedState] = useState(() => cloneDeep({ filters, shareableState }))
    const [isCopied, setIsCopied] = useState<boolean>(false)

    // Check if the sidebar state has changed since the last share and memoize result
    const sidebarStateHasChanged = useMemo(
        () => !isEqual(sharedState, { filters, shareableState }),
        [sharedState, filters, shareableState],
    )

    // Update uniqueId only if the sidebar state changes
    const uniqueId = useMemo(() => v4(), [filters, shareableState])

    // Handle the logic for the URL and store in KV
    const handleShareUrl = async () => {
        if (!pathname.includes('visualise') && !pathname.includes('outbreaks/')) {
            return ''
        }

        // Nothing new to store, but the state on screen may itself have come from
        // a share link — keep that id rather than handing out a bare URL.
        if (!sidebarStateHasChanged) {
            const currentId = new URLSearchParams(window.location.search).get('share')

            return currentId ? `?share=${currentId}` : ''
        }

        const queryString = `?share=${uniqueId}`

        await setKvDatabase(uniqueId, packSharePayload(filters, shareableState))

        router.push(queryString)

        return queryString
    }

    // Build the relevant URL and copy to the clipboard
    const handleShareClick = async () => {
        const shareUrl = await handleShareUrl()
        const fullUrl = `${window.location.origin}${pathname}${shareUrl}`

        if (window.innerWidth < 1024 && navigator.share) {
            try {
                await navigator.share({
                    title: 'Pandemic Pact',
                    url: fullUrl
                })
            } catch (error) {
                console.error('Share functionality via "navigator.share" has failed.', error)
            }
        } else {
            navigator.clipboard.writeText(fullUrl)
        }

        setIsCopied(true)

        setSharedState(cloneDeep({ filters, shareableState }))

        setTimeout(() => {
            setIsCopied(false)
        }, 3000)
    }

    const notificationClasses = [
        'px-2 flex items-center rounded',
        colourClasses,
        !sidebarOpen ? 'hidden' : 'inline-flex'
    ].filter(Boolean).join(' ')

    return (
        <>

            {!isCopied ? (
                <button onClick={handleShareClick}>
                    <ShareIcon className={iconClasses} aria-hidden="true" />
                </button>
            ) : (
                <div className="flex items-center gap-x-2">
                    <p className={notificationClasses}>
                        URL Copied To Clipboard
                    </p> <span>
                        <CheckIcon className={iconClasses} aria-hidden="true"/>
                    </span>
                </div>
            )}

        </>
    )
}

export default ShareButton
