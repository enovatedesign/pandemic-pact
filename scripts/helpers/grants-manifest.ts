import crypto from 'crypto'
import { put } from '@vercel/blob'
import { getBranchName } from './get-branch-name'
import { useS3 } from './storage'
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
 * Reads the previous manifest. From S3 (GetObject — never CDN-stale) when on the
 * S3 backend, otherwise from Blob over HTTP. Returns {} when absent or invalid,
 * which the caller treats as "no previous state — do a full upload".
 */
export async function readManifest(): Promise<GrantsManifest> {
    try {
        let body: string | null = null

        if (useS3()) {
            body = await s3GetObjectString(manifestKey())
        } else {
            const baseUrl = process.env.BLOB_BASE_URL
            if (!baseUrl) return {}
            const res = await fetch(`${baseUrl}/${manifestKey()}`)
            if (!res.ok) return {}
            body = await res.text()
        }

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

    if (useS3()) {
        // no-store so the gate never reads a CDN-cached manifest between builds
        await s3PutObject(manifestKey(), body, 'application/json', 'no-store')
        return
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        warn('BLOB_READ_WRITE_TOKEN not set, skipping manifest write')
        return
    }

    await put(manifestKey(), body, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
    })
}
