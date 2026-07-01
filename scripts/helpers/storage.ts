/**
 * Storage backend dispatcher.
 *
 * Selects between Vercel Blob (default) and Amazon S3 based on the
 * STORAGE_BACKEND env var (`blob` | `s3`). Build/CI call sites import the
 * unified functions below so the migration can be flipped per-environment and
 * rolled back instantly.
 *
 * Covers grant files, the cache artefacts, the freshness marker/manifest, and
 * the PubMed objects (pubmed/* + the consolidated cache/metadata), which the
 * weekly job writes and the grant pages read.
 */
import { put } from '@vercel/blob'
import { s3PutObject, s3GetObjectString } from './s3-client'
import { warn } from './log'
import { uploadGrantsToBlob, uploadGrantsIncrementalToBlob } from './upload-grants-to-blob'
import { uploadGrantsToS3, uploadGrantsIncrementalToS3 } from './upload-grants-to-s3'
import { uploadStaticFilesToBlob } from './upload-static-files-to-blob'
import { uploadStaticFilesToS3 } from './upload-static-files-to-s3'
import { downloadStaticFilesFromBlob } from './download-static-files-from-blob'
import { downloadStaticFilesFromS3 } from './download-static-files-from-s3'
import { verifyBlobGrants } from './verify-blob-grants'
import { verifyGrantsS3 } from './verify-grants-s3'
import {
    readGrantsLastUsedFileId as readBlobMarker,
    writeGrantsLastUsedFileId as writeBlobMarker,
} from './grants-marker'
import {
    readGrantsLastUsedFileIdS3,
    writeGrantsLastUsedFileIdS3,
} from './grants-marker-s3'

export function useS3(): boolean {
    return process.env.STORAGE_BACKEND === 's3'
}

/** Public read base for grant/cache objects (CloudFront for S3, Blob otherwise). */
export function assetReadBaseUrl(): string | undefined {
    return useS3() ? process.env.ASSET_BASE_URL : process.env.BLOB_BASE_URL
}

export async function uploadGrants(options: {
    grants: Array<{ id: string; data: any }>
}): Promise<void> {
    return useS3() ? uploadGrantsToS3(options) : uploadGrantsToBlob(options)
}

/**
 * Incremental upload: PUT only changed grants, DELETE only removed ones, and
 * (unlike uploadGrants) do NOT orphan-sweep. Use only when a previous manifest
 * exists; first runs must use uploadGrants so the orphan sweep reconciles state.
 */
export async function uploadGrantsIncremental(options: {
    changed: Array<{ id: string; data: any }>
    removedIds: string[]
}): Promise<void> {
    return useS3()
        ? uploadGrantsIncrementalToS3(options)
        : uploadGrantsIncrementalToBlob(options)
}

export async function uploadStaticFiles(): Promise<void> {
    return useS3() ? uploadStaticFilesToS3() : uploadStaticFilesToBlob()
}

export async function downloadStaticFiles(): Promise<boolean> {
    return useS3() ? downloadStaticFilesFromS3() : downloadStaticFilesFromBlob()
}

export async function verifyGrants(grantIds: string[]): Promise<boolean> {
    return useS3() ? verifyGrantsS3(grantIds) : verifyBlobGrants(grantIds)
}

export async function readGrantsLastUsedFileId(): Promise<number | null> {
    return useS3() ? readGrantsLastUsedFileIdS3() : readBlobMarker()
}

export async function writeGrantsLastUsedFileId(id: number): Promise<void> {
    return useS3() ? writeGrantsLastUsedFileIdS3(id) : writeBlobMarker(id)
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
    if (useS3()) {
        await s3PutObject(key, body, 'application/json', cacheControl)
        return
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        warn('BLOB_READ_WRITE_TOKEN not set, skipping PubMed blob write')
        return
    }

    await put(key, body, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
    })
}

/**
 * Read a PubMed object as a string, or null if absent. On S3 this uses GetObject
 * (never CDN-stale), which matters for the consolidated cache/metadata that the
 * weekly job's freshness logic depends on.
 */
export async function readPubMedObjectString(key: string): Promise<string | null> {
    if (useS3()) {
        return s3GetObjectString(key)
    }

    const baseUrl = process.env.BLOB_BASE_URL
    if (!baseUrl) return null

    const res = await fetch(`${baseUrl}/${key}`)
    if (!res.ok) return null
    return res.text()
}
