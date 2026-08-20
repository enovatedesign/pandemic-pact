'use client'

import { useEffect, useRef } from 'react'

/**
 * Restores the scroll position when a reader comes back to a search page.
 *
 * The browser would normally do this itself, but the results are fetched on the
 * client: at the point it restores the scroll the page is only a masthead tall
 * and there is nowhere to scroll to. Nor can bfcache stand in — the search
 * pages are dynamic and served `no-store`, and a `next/link` result opened from
 * the table never leaves the document in the first place.
 */

const RECORD_THROTTLE_MS = 150

const RESTORE_INTERVAL_MS = 50

const RESTORE_TIMEOUT_MS = 2000

function readStoredScrollPosition(storageKey: string) {
    try {
        const position = Number(window.sessionStorage.getItem(storageKey))

        return Number.isFinite(position) ? position : 0
    } catch {
        // Disabled storage — the page works, it just won't remember.
        return 0
    }
}

export default function useSearchScrollRestoration(
    storageKey: string,
    resultsHaveRendered: boolean,
    isReturnVisit: boolean,
) {
    const storedPositionRef = useRef<number | null>(null)
    const hasRestoredRef = useRef(false)

    // Read on mount, and above the recording effect, so the position survives
    // whatever the browser does to the scroll of a page that has no results in
    // it yet. Whether it is used at all is settled later.
    useEffect(() => {
        storedPositionRef.current = readStoredScrollPosition(storageKey)
    }, [storageKey])

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | null = null

        const record = () => {
            timeout = null

            try {
                window.sessionStorage.setItem(
                    storageKey,
                    String(Math.round(window.scrollY)),
                )
            } catch {
                // See readStoredScrollPosition.
            }
        }

        const onScroll = () => {
            if (!timeout) {
                timeout = setTimeout(record, RECORD_THROTTLE_MS)
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })

        // Leaving the page can beat the throttle, and the position at that
        // moment is the one worth keeping.
        window.addEventListener('pagehide', record)

        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('pagehide', record)

            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [storageKey])

    useEffect(() => {
        const position = storedPositionRef.current

        if (
            !isReturnVisit ||
            !resultsHaveRendered ||
            !position ||
            hasRestoredRef.current
        ) {
            return
        }

        let interval: ReturnType<typeof setInterval> | null = null

        const deadline = performance.now() + RESTORE_TIMEOUT_MS

        // Scrolling for themselves outranks anything being restored for them.
        const interruptions = ['wheel', 'touchstart', 'keydown']

        const clearListeners = () =>
            interruptions.forEach(event =>
                window.removeEventListener(event, stop),
            )

        function stop() {
            hasRestoredRef.current = true

            if (interval) {
                clearInterval(interval)
                interval = null
            }

            clearListeners()
        }

        // Restoring has to be instant: the site scrolls smoothly by default,
        // and an animated jump would both look wrong and never settle within
        // the retries below.
        const restore = () => {
            window.scrollTo({ top: position, behavior: 'instant' })

            if (
                Math.abs(window.scrollY - position) <= 1 ||
                performance.now() > deadline
            ) {
                stop()
            }
        }

        interruptions.forEach(event =>
            window.addEventListener(event, stop, { passive: true }),
        )

        restore()

        // Fonts, images and the rest of the results can all still grow the page
        // under us, so the position is reapplied until it sticks.
        if (!hasRestoredRef.current) {
            interval = setInterval(restore, RESTORE_INTERVAL_MS)
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }

            clearListeners()
        }
    }, [isReturnVisit, resultsHaveRendered])
}
