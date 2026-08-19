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
