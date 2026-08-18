import { info, warn } from './log'
import { getBranchName } from './get-branch-name'
import {
    s3PutObject,
    s3ListKeys,
    s3DeleteObjects,
    mapWithConcurrency,
    invalidateCloudFront,
} from './s3-client'

export interface UploadTrialsOptions {
    trials: Array<{ id: string; data: any }>
    concurrency?: number
}

/**
 * Uploads clinical trial files to S3 with high concurrency.
 * Uses predictable keys with format: {branch}/clinical-trials/{trialId}.json
 * Includes orphan cleanup + a >1% failure-rate abort.
 *
 * Direct analogue of uploadGrants (grants dataset) so the trial detail route can
 * read from the same branch-aware S3/CloudFront layout when USE_REMOTE_STORAGE
 * is enabled.
 */
export async function uploadTrials(
    options: UploadTrialsOptions,
): Promise<void> {
    const { trials, concurrency = 64 } = options

    const branchName = getBranchName()
    info(`Uploading ${trials.length} clinical trials to S3 for branch "${branchName}"...`)

    const errors: Array<{ id: string; error: string }> = []
    let uploaded = 0

    await mapWithConcurrency(trials, concurrency, async trial => {
        const key = `${branchName}/clinical-trials/${trial.id}.json`
        try {
            await s3PutObject(key, JSON.stringify(trial.data))
            uploaded++
            if (uploaded % 1000 === 0 || uploaded === trials.length) {
                info(`Uploaded ${uploaded}/${trials.length} clinical trials to S3`)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            errors.push({ id: trial.id, error: message })
            warn(`Failed to upload clinical trial ${trial.id}: ${message}`)
        }
    })

    // --- Orphaned file cleanup ---
    info('Checking for orphaned clinical trial files to delete...')
    const expectedKeys = new Set(
        trials.map(t => `${branchName}/clinical-trials/${t.id}.json`),
    )
    let orphaned: string[] = []
    try {
        const found = await s3ListKeys(`${branchName}/clinical-trials/`)
        orphaned = found.filter(key => !expectedKeys.has(key))
    } catch (e) {
        warn('Failed to list S3 objects for orphan cleanup: ' + (e instanceof Error ? e.message : String(e)))
    }
    if (orphaned.length > 0) {
        info(`Found ${orphaned.length} orphaned clinical trial files. Deleting...`)
        await s3DeleteObjects(orphaned)
    } else {
        info('No orphaned clinical trial files found.')
    }

    if (errors.length > 0) {
        warn(`Failed to upload ${errors.length} clinical trials:`)
        errors.slice(0, 10).forEach(({ id, error }) => warn(`  ${id}: ${error}`))
        if (errors.length > 10) {
            warn(`  ... and ${errors.length - 10} more errors`)
        }

        const failureRate = errors.length / trials.length
        if (failureRate > 0.01) {
            throw new Error(
                `Too many clinical trial uploads failed: ${errors.length}/${trials.length} (${(failureRate * 100).toFixed(1)}%). Aborting to prevent data loss.`,
            )
        }
    }

    // Full rebuild: invalidate the whole clinical-trials prefix.
    await invalidateCloudFront([`/${branchName}/clinical-trials/*`])

    info(`Successfully uploaded ${uploaded} clinical trials to S3`)
}
