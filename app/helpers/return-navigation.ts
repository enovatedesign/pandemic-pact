/**
 * Whether the reader arrived by going back or forward rather than by starting a
 * fresh visit — the difference between picking up where they left off and
 * opening the page anew.
 *
 * A back into a search page can reach it two ways: as a document load (a result
 * opened with a plain link) or as a popstate the App Router handles without
 * leaving the document (a result opened with `next/link`). Only the first is
 * visible in the navigation timing, so the second is recorded here.
 */

let poppedTo: string | null = null

if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
        poppedTo = window.location.pathname
    })
}

/**
 * The path is what tells a back into this page apart from a back out of it,
 * which shouldn't restore anything when the reader later returns by their own
 * choice. A document loaded by back or forward counts for its lifetime: there
 * is no way to see a `pushState` from out here to end it.
 */
export function isReturnNavigation() {
    if (poppedTo === window.location.pathname) {
        return true
    }

    const [navigation] = performance.getEntriesByType(
        'navigation',
    ) as PerformanceNavigationTiming[]

    return navigation?.type === 'back_forward'
}

/**
 * The App Router can commit a same-document back either side of the page
 * mounting, so a return is only reliably readable once the task that carried
 * the popstate has finished.
 */
export function afterCurrentTask() {
    return new Promise(resolve => setTimeout(resolve, 0))
}
