/**
 * Persistence for the Explore pages' filter state.
 *
 * The query string is an entry point only — deep links from the visualisations
 * (`?filters=`), the detail-page back links (`?q=`) and share links (`?share=`).
 * Live state is kept here instead, because the advanced search model is far too
 * large to encode in a URL and rewriting the query string on every keystroke made
 * for unreadable links.
 *
 * Bump STATE_VERSION when the persisted shape changes incompatibly; mismatched
 * envelopes are discarded rather than migrated.
 */
const STATE_VERSION = 1

export const GRANTS_EXPLORE_STORAGE_KEY = 'pandemic-pact:grants-explore'

export const CLINICAL_TRIALS_EXPLORE_STORAGE_KEY =
    'pandemic-pact:clinical-trials-explore'

// Scroll positions are per-tab and per-visit rather than per-user, so they live
// in sessionStorage and are read by `useSearchScrollRestoration`.
export const GRANTS_EXPLORE_SCROLL_KEY = 'pandemic-pact:grants-explore-scroll'

export const CLINICAL_TRIALS_EXPLORE_SCROLL_KEY =
    'pandemic-pact:clinical-trials-explore-scroll'

interface StorageEnvelope<T> {
    version: number
    state: T
}

export function readPersistedExploreState<T>(storageKey: string): T | null {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        const stored = window.localStorage.getItem(storageKey)

        if (!stored) {
            return null
        }

        const envelope: StorageEnvelope<T> = JSON.parse(stored)

        return envelope?.version === STATE_VERSION ? envelope.state : null
    } catch {
        // Disabled storage, a full quota or corrupt JSON — start from defaults
        // rather than taking the page down.
        return null
    }
}

export function persistExploreState(storageKey: string, state: unknown) {
    if (typeof window === 'undefined') {
        return
    }

    try {
        window.localStorage.setItem(
            storageKey,
            JSON.stringify({ version: STATE_VERSION, state }),
        )
    } catch {
        // Nothing actionable — the page works, it just won't remember.
    }
}

export function clearPersistedExploreState(storageKey: string) {
    if (typeof window === 'undefined') {
        return
    }

    try {
        window.localStorage.removeItem(storageKey)
    } catch {
        // See persistExploreState.
    }
}
