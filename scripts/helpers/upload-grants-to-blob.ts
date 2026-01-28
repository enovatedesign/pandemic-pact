import { put, list, del } from '@vercel/blob'
import { info, warn } from './log'
import { getBranchName } from './get-branch-name'

export interface UploadGrantsToBlobOptions {
    grants: Array<{ id: string; data: any }>
    batchSize?: number
}

/**
 * Uploads grant files to Vercel Blob Storage in batches
 * Uses predictable URLs with format: {branch}/grants/{grantId}.json
 */
export async function uploadGrantsToBlob(
    options: UploadGrantsToBlobOptions
): Promise<void> {
    const { grants, batchSize = 10 } = options
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        warn('BLOB_READ_WRITE_TOKEN not found, skipping blob upload')
        return
    }

    const branchName = getBranchName()
    info(`Uploading ${grants.length} grants to Vercel Blob Storage for branch "${branchName}"...`)

    let uploaded = 0
    const errors: Array<{ id: string; error: string }> = []

    // Track uploaded grant paths for cleanup
    const uploadedPaths = new Set<string>()


    // Process in smaller batches with delays to respect rate limits
    for (let i = 0; i < grants.length; i += batchSize) {
        const batch = grants.slice(i, i + batchSize)
        await Promise.all(
            batch.map(async (grant) => {
                try {
                    const pathname = `${branchName}/grants/${grant.id}.json`
                    await put(pathname, JSON.stringify(grant.data), {
                        access: 'public',
                        addRandomSuffix: false,
                    })
                    uploadedPaths.add(pathname)
                    uploaded++
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error)
                    errors.push({ id: grant.id, error: errorMessage })
                    warn(`Failed to upload grant ${grant.id}: ${errorMessage}`)
                }
            })
        )
        // Log progress
        if (uploaded > 0 && (uploaded % 500 === 0 || i + batchSize >= grants.length)) {
            info(`Uploaded ${uploaded}/${grants.length} grants to Blob Storage`)
        }
        // Add a small delay between batches to avoid rate limiting
        if (i + batchSize < grants.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }

    // --- Orphaned file cleanup ---
    info('Checking for orphaned grant files to delete...')
    let orphaned: string[] = []
    try {
        let cursor: string | undefined = undefined
        do {
            const result: { blobs: { pathname: string }[]; cursor?: string } = await list({ prefix: `${branchName}/grants/`, limit: 1000, cursor })
            const found: string[] = result.blobs.map((blob: { pathname: string }) => blob.pathname)
            const batchOrphans: string[] = found.filter((path: string) => !uploadedPaths.has(path))
            orphaned.push(...batchOrphans)
            cursor = result.cursor
        } while (cursor)
    } catch (e) {
        warn('Failed to list blobs for orphan cleanup: ' + (e instanceof Error ? e.message : String(e)))
    }
    if (orphaned.length > 0) {
        info(`Found ${orphaned.length} orphaned grant files. Deleting in batches...`)
        const deleteBatchSize = 100
        for (let i = 0; i < orphaned.length; i += deleteBatchSize) {
            const batch = orphaned.slice(i, i + deleteBatchSize)
            try {
                await del(batch)
                info(`Deleted orphaned grant files: ${batch.join(', ')}`)
            } catch (e) {
                warn('Failed to delete some orphaned grant files: ' + (e instanceof Error ? e.message : String(e)))
            }
        }
    } else {
        info('No orphaned grant files found.')
    }

    if (errors.length > 0) {
        warn(`Failed to upload ${errors.length} grants:`)
        errors.slice(0, 10).forEach(({ id, error }) => {
            warn(`  ${id}: ${error}`)
        })
        if (errors.length > 10) {
            warn(`  ... and ${errors.length - 10} more errors`)
        }
    }

    info(`Successfully uploaded ${uploaded} grants to Vercel Blob Storage`)
}
