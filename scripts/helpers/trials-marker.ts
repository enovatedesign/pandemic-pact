import { getBranchName } from './get-branch-name'
import { s3PutObject, s3GetObjectString } from './s3-client'
import { warn } from './log'

const MARKER_FILENAME = 'trials-last-used-file-id.json'

function markerKey(): string {
    return `${getBranchName()}/cache/clinical-trials/${MARKER_FILENAME}`
}

/**
 * The Figshare source file IDs baked into the cached clinical-trials artefacts on
 * the last successful generate.
 *
 * The data dictionary is tracked alongside the dataset because it is what
 * select-options, the record labels and the canonical checkbox codes are all
 * built from — a dictionary-only bump changes every label on the site while
 * leaving the dataset untouched, so gating on the dataset id alone would skip it.
 */
export interface LastUsedTrialsFileIds {
    trialsId: number | null
    dictionaryId: number | null
}

/**
 * Reads the marker directly from S3 (GetObject) rather than via CloudFront, so
 * the cache-gate decision is never made against a stale CDN-cached value.
 *
 * Branch-scoped (like the grants marker): a new branch has no marker, so it
 * always does a full generate first — which populates that branch's S3 prefix
 * and OpenSearch index — before any later build is allowed to skip.
 *
 * Back-compat: markers written before the dictionary id was tracked hold only
 * `{ id }`, so `dictionaryId` reads back as null — treated as changed, which
 * self-heals on the next full generate.
 */
export async function readTrialsLastUsedFileIds(): Promise<LastUsedTrialsFileIds> {
    const empty: LastUsedTrialsFileIds = { trialsId: null, dictionaryId: null }

    try {
        const body = await s3GetObjectString(markerKey())

        if (!body) return empty

        const data = JSON.parse(body)
        const num = (v: unknown): number | null => (typeof v === 'number' ? v : null)

        return {
            trialsId: num(data?.trialsId) ?? num(data?.id),
            dictionaryId: num(data?.dictionaryId),
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        warn(`Failed to read clinical-trials marker from S3: ${msg}`)
        return empty
    }
}

export async function writeTrialsLastUsedFileIds(
    ids: LastUsedTrialsFileIds,
): Promise<void> {
    // no-store so a stale marker is never served/read between builds. `id` is kept
    // alongside `trialsId` so an older build (post-rollback) can still read it.
    const body = JSON.stringify({
        id: ids.trialsId,
        trialsId: ids.trialsId,
        dictionaryId: ids.dictionaryId,
    })

    await s3PutObject(markerKey(), body, 'application/json', 'no-store')
}
