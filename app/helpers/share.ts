import { createContext } from 'react'

import { Filters } from './filters'

/**
 * Sidebar state a share link has to carry that isn't part of the filter set
 * itself — currently just the clinical trials "exclude linked trials" switch.
 * Pages that have none can skip the provider and get the empty default.
 */
export const ShareableStateContext = createContext<{
    shareableState: Record<string, unknown>
}>({
    shareableState: {},
})

interface SharePayload {
    version: 2
    filters: Filters
    shareableState: Record<string, unknown>
}

export interface SharedState {
    filters: Filters
    shareableState: Record<string, unknown>
}

export function packSharePayload(
    filters: Filters,
    shareableState: Record<string, unknown>,
): SharePayload {
    return { version: 2, filters, shareableState }
}

/**
 * Share links are stored in KV with a ~6 month TTL, so payloads written before
 * non-filter state was shareable — a bare filter set — must still open.
 */
export function unpackSharePayload(payload: any): SharedState | null {
    if (!payload) {
        return null
    }

    if (payload.version === 2) {
        return {
            filters: payload.filters,
            shareableState: payload.shareableState ?? {},
        }
    }

    return { filters: payload as Filters, shareableState: {} }
}

export type ExploreShareKind = 'grants-explore' | 'clinical-trials-explore'

interface ExploreSharePayload {
    version: 3
    kind: ExploreShareKind
    state: unknown
}

/**
 * Explore share links carry the whole search state — query, both tabs' filters
 * and which tab is showing — rather than the sidebar's filter set, so they are
 * kept in their own payload shape and tagged with the page that wrote them.
 */
export function packExploreSharePayload(
    kind: ExploreShareKind,
    state: unknown,
): ExploreSharePayload {
    return { version: 3, kind, state }
}

/** Returns null for anything that isn't a share payload written by this page. */
export function unpackExploreSharePayload(
    payload: any,
    kind: ExploreShareKind,
): unknown | null {
    if (payload?.version !== 3 || payload.kind !== kind) {
        return null
    }

    return payload.state
}
