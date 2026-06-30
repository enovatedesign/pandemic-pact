import { getBranchName } from './get-branch-name'
import { s3PutObject, s3GetObjectString } from './s3-client'
import { warn } from './log'

const MARKER_FILENAME = 'grants-last-used-file-id.json'

function markerKey(): string {
    return `${getBranchName()}/cache/${MARKER_FILENAME}`
}

/**
 * Reads the marker directly from S3 (GetObject) rather than via CloudFront, so
 * the cache-gate decision is never made against a stale CDN-cached value.
 */
export async function readGrantsLastUsedFileIdS3(): Promise<number | null> {
    try {
        const body = await s3GetObjectString(markerKey())
        if (!body) return null
        const data = JSON.parse(body)
        return typeof data?.id === 'number' ? data.id : null
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        warn(`Failed to read grants marker from S3: ${msg}`)
        return null
    }
}

export async function writeGrantsLastUsedFileIdS3(id: number): Promise<void> {
    // no-store so a stale marker is never served/read between builds
    await s3PutObject(markerKey(), JSON.stringify({ id }), 'application/json', 'no-store')
}
