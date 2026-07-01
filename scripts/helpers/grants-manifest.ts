import crypto from 'crypto'
import { getBranchName } from './get-branch-name'
import { s3GetObjectString, s3PutObject } from './s3-client'
import { warn } from './log'

const MANIFEST_FILENAME = 'grants-manifest.json'

function manifestKey(): string {
    return `${getBranchName()}/cache/${MANIFEST_FILENAME}`
}

/** Map of GrantID -> sha256 hex of the exact JSON string stored for that grant. */
export type GrantsManifest = Record<string, string>

export function hashGrant(jsonString: string): string {
    return crypto.createHash('sha256').update(jsonString).digest('hex')
}

/**
 * Reads the previous manifest from S3 (GetObject — never CDN-stale). Returns {}
 * when absent or invalid, which the caller treats as "no previous state — do a
 * full upload".
 */
export async function readManifest(): Promise<GrantsManifest> {
    try {
        const body = await s3GetObjectString(manifestKey())

        if (!body) return {}
        const data = JSON.parse(body)
        return data && typeof data === 'object' ? (data as GrantsManifest) : {}
    } catch (err) {
        warn(`Failed to read grants manifest: ${err instanceof Error ? err.message : String(err)}`)
        return {}
    }
}

/**
 * Writes the new manifest. Must be called LAST — only after all grant uploads
 * and deletes have succeeded — so a crash mid-upload never records files as
 * stored when they aren't (the next build would then skip them).
 */
export async function writeManifest(manifest: GrantsManifest): Promise<void> {
    const body = JSON.stringify(manifest)

    // no-store so the gate never reads a CDN-cached manifest between builds
    await s3PutObject(manifestKey(), body, 'application/json', 'no-store')
}
