/**
 * Storage helpers for grant/cache/PubMed objects on Amazon S3 (served via
 * CloudFront). Build/CI call sites import the unified functions below.
 *
 * Covers grant files, the cache artefacts, the freshness marker/manifest, and
 * the PubMed objects (pubmed/* + the consolidated cache/metadata), which the
 * weekly job writes and the grant pages read.
 */
import { s3PutObject, s3GetObjectString } from './s3-client'

export { uploadGrants, uploadGrantsIncremental } from './upload-grants'
export { uploadStaticFiles } from './upload-static-files'
export { downloadStaticFiles } from './download-static-files'
export { verifyGrants } from './verify-grants'
export {
    readLastUsedFileIds,
    writeLastUsedFileIds,
} from './grants-marker'

/** Public read base for grant/cache objects (CloudFront). */
export function assetReadBaseUrl(): string | undefined {
    return process.env.ASSET_BASE_URL
}

/**
 * Write a PubMed object. Keys are root-level (NOT branch-scoped), matching the
 * runtime read paths. Pass cacheControl 'no-store' for the consolidated cache /
 * metadata (read fresh by the weekly job); leave it default for per-grant files
 * (served at runtime with their own revalidate window).
 */
export async function putPubMedObject(
    key: string,
    body: string,
    cacheControl?: string,
): Promise<void> {
    await s3PutObject(key, body, 'application/json', cacheControl)
}

/**
 * Read a PubMed object as a string, or null if absent. Uses GetObject (never
 * CDN-stale), which matters for the consolidated cache/metadata that the weekly
 * job's freshness logic depends on.
 */
export async function readPubMedObjectString(key: string): Promise<string | null> {
    return s3GetObjectString(key)
}
