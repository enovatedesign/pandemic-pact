import { getBranchName } from './get-branch-name'
import { s3PutObject, s3GetObjectString } from './s3-client'
import { warn } from './log'

const MARKER_FILENAME = 'grants-last-used-file-id.json'

function markerKey(): string {
    return `${getBranchName()}/cache/${MARKER_FILENAME}`
}

/**
 * The Figshare source file IDs baked into the cached artefacts on the last
 * successful generate. Bumping any of these in data-sources.ts must invalidate
 * the cache, so the freshness gate compares all of them against this marker.
 */
export interface LastUsedFileIds {
    grantsId: number | null
    rrnaId: number | null
    dictionaryId: number | null
    rrnaDictionaryId: number | null
}

/**
 * Reads the marker directly from S3 (GetObject) rather than via CloudFront, so
 * the cache-gate decision is never made against a stale CDN-cached value.
 *
 * Back-compat: markers written before a given id was tracked simply omit it, so
 * it reads back as `null` — which the freshness gate treats as changed and
 * self-heals on the next full generate. (The very first marker stored only the
 * grants id as `{ id }`, still honoured below.)
 */
export async function readLastUsedFileIds(): Promise<LastUsedFileIds> {
    const empty: LastUsedFileIds = {
        grantsId: null,
        rrnaId: null,
        dictionaryId: null,
        rrnaDictionaryId: null,
    }
    try {
        const body = await s3GetObjectString(markerKey())
        if (!body) return empty
        const data = JSON.parse(body)
        const num = (v: unknown): number | null => (typeof v === 'number' ? v : null)
        const grantsId = num(data?.grantsId) ?? num(data?.id)
        return {
            grantsId,
            rrnaId: num(data?.rrnaId),
            dictionaryId: num(data?.dictionaryId),
            rrnaDictionaryId: num(data?.rrnaDictionaryId),
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        warn(`Failed to read data source marker from S3: ${msg}`)
        return empty
    }
}

export async function writeLastUsedFileIds(ids: LastUsedFileIds): Promise<void> {
    // no-store so a stale marker is never served/read between builds. `id` is
    // kept alongside grantsId so an older build (post-rollback) can still read it.
    const body = JSON.stringify({
        id: ids.grantsId,
        grantsId: ids.grantsId,
        rrnaId: ids.rrnaId,
        dictionaryId: ids.dictionaryId,
        rrnaDictionaryId: ids.rrnaDictionaryId,
    })
    await s3PutObject(markerKey(), body, 'application/json', 'no-store')
}
