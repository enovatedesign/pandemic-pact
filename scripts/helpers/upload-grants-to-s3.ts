import { info, warn } from './log'
import { getBranchName } from './get-branch-name'
import {
    s3PutObject,
    s3ListKeys,
    s3DeleteObjects,
    mapWithConcurrency,
    invalidateCloudFront,
} from './s3-client'

export interface UploadGrantsToS3Options {
    grants: Array<{ id: string; data: any }>
    concurrency?: number
}

/**
 * Uploads grant files to S3 with high concurrency.
 * Uses predictable keys with format: {branch}/grants/{grantId}.json
 * Mirrors uploadGrantsToBlob (orphan cleanup + >1% failure-rate abort).
 */
export async function uploadGrantsToS3(
    options: UploadGrantsToS3Options,
): Promise<void> {
    const { grants, concurrency = 64 } = options

    const branchName = getBranchName()
    info(`Uploading ${grants.length} grants to S3 for branch "${branchName}"...`)

    const errors: Array<{ id: string; error: string }> = []
    let uploaded = 0

    await mapWithConcurrency(grants, concurrency, async grant => {
        const key = `${branchName}/grants/${grant.id}.json`
        try {
            await s3PutObject(key, JSON.stringify(grant.data))
            uploaded++
            if (uploaded % 1000 === 0 || uploaded === grants.length) {
                info(`Uploaded ${uploaded}/${grants.length} grants to S3`)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            errors.push({ id: grant.id, error: message })
            warn(`Failed to upload grant ${grant.id}: ${message}`)
        }
    })

    // --- Orphaned file cleanup ---
    info('Checking for orphaned grant files to delete...')
    const expectedKeys = new Set(
        grants.map(g => `${branchName}/grants/${g.id}.json`),
    )
    let orphaned: string[] = []
    try {
        const found = await s3ListKeys(`${branchName}/grants/`)
        orphaned = found.filter(key => !expectedKeys.has(key))
    } catch (e) {
        warn('Failed to list S3 objects for orphan cleanup: ' + (e instanceof Error ? e.message : String(e)))
    }
    if (orphaned.length > 0) {
        info(`Found ${orphaned.length} orphaned grant files. Deleting...`)
        await s3DeleteObjects(orphaned)
    } else {
        info('No orphaned grant files found.')
    }

    if (errors.length > 0) {
        warn(`Failed to upload ${errors.length} grants:`)
        errors.slice(0, 10).forEach(({ id, error }) => warn(`  ${id}: ${error}`))
        if (errors.length > 10) {
            warn(`  ... and ${errors.length - 10} more errors`)
        }

        const failureRate = errors.length / grants.length
        if (failureRate > 0.01) {
            throw new Error(
                `Too many grant uploads failed: ${errors.length}/${grants.length} (${(failureRate * 100).toFixed(1)}%). Aborting to prevent data loss.`,
            )
        }
    }

    // Full rebuild: invalidate the whole grants prefix. The incremental path
    // below invalidates only the changed keys.
    await invalidateCloudFront([`/${branchName}/grants/*`])

    info(`Successfully uploaded ${uploaded} grants to S3`)
}

export interface UploadGrantsIncrementalToS3Options {
    changed: Array<{ id: string; data: any }>
    removedIds: string[]
    concurrency?: number
}

/**
 * Incremental upload: PUT only the changed/new grants and DELETE only the
 * removed ones. Does NOT run the orphan sweep (that would delete every unchanged
 * grant, since only the changed subset is passed). CloudFront invalidation is
 * scoped to exactly the touched keys, falling back to a prefix wildcard when the
 * change set is large.
 */
export async function uploadGrantsIncrementalToS3(
    options: UploadGrantsIncrementalToS3Options,
): Promise<void> {
    const { changed, removedIds, concurrency = 64 } = options

    const branchName = getBranchName()
    info(
        `Incremental S3 upload for branch "${branchName}": ${changed.length} changed, ${removedIds.length} removed`,
    )

    const errors: Array<{ id: string; error: string }> = []
    let uploaded = 0

    await mapWithConcurrency(changed, concurrency, async grant => {
        const key = `${branchName}/grants/${grant.id}.json`
        try {
            await s3PutObject(key, JSON.stringify(grant.data))
            uploaded++
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            errors.push({ id: grant.id, error: message })
            warn(`Failed to upload grant ${grant.id}: ${message}`)
        }
    })

    if (removedIds.length > 0) {
        info(`Deleting ${removedIds.length} removed grant files from S3...`)
        await s3DeleteObjects(
            removedIds.map(id => `${branchName}/grants/${id}.json`),
        )
    }

    if (errors.length > 0) {
        warn(`Failed to upload ${errors.length} of ${changed.length} changed grants:`)
        errors.slice(0, 10).forEach(({ id, error }) => warn(`  ${id}: ${error}`))
        const failureRate = changed.length > 0 ? errors.length / changed.length : 0
        if (failureRate > 0.01) {
            throw new Error(
                `Too many grant uploads failed: ${errors.length}/${changed.length} (${(failureRate * 100).toFixed(1)}%). Aborting to prevent data loss.`,
            )
        }
    }

    // Invalidate only the touched keys. CloudFront limits paths per request and
    // bills per path, so for large change sets fall back to a single wildcard.
    const touched = changed.length + removedIds.length
    if (touched > 0) {
        if (touched > 1000) {
            await invalidateCloudFront([`/${branchName}/grants/*`])
        } else {
            await invalidateCloudFront([
                ...changed.map(g => `/${branchName}/grants/${g.id}.json`),
                ...removedIds.map(id => `/${branchName}/grants/${id}.json`),
            ])
        }
    }

    info(
        `Incremental S3 upload complete: ${uploaded} uploaded, ${removedIds.length} deleted`,
    )
}
