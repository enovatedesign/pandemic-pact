import { put } from '@vercel/blob'
import { title, info, warn } from './log'
import { pubmedFileName } from '../../app/helpers/pubmed-ids'
import { getPubMedLinks, PubMedLinkResult } from '../generate/fetch-pub-med-data'
import { RetryOptions } from './pubmed-retry'

const BLOB_BASE_URL = process.env.BLOB_BASE_URL || 'https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com'
const CACHE_FILENAME = 'cached-pub-med-publications.json'
const BATCH_SIZE = 50

/**
 * Audit individual PubMed blob files against the consolidated cache.
 *
 * For each grant ID in the cache that has publications, checks whether
 * the individual blob file exists. Missing files are re-fetched fresh
 * from the Europe PMC API and uploaded to blob storage.
 */
export async function auditPubmedBlobs(): Promise<void> {
    title('Auditing individual PubMed blob files')

    // 1. Load consolidated cache to get the full list of grant IDs
    let grantIds: string[]

    try {
        const cacheResponse = await fetch(`${BLOB_BASE_URL}/${CACHE_FILENAME}`)

        if (!cacheResponse.ok) {
            warn(`Cannot load consolidated PubMed cache: ${cacheResponse.status} ${cacheResponse.statusText}`)
            return
        }

        const cache = await cacheResponse.json()

        if (!cache.publications) {
            warn('Consolidated cache has no publications key')
            return
        }

        // Only check grants that actually have publications
        grantIds = Object.entries(cache.publications)
            .filter(([_, pubs]) => Array.isArray(pubs) && (pubs as any[]).length > 0)
            .map(([id]) => id)
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        warn(`Failed to load consolidated PubMed cache: ${msg}`)
        return
    }

    info(`Checking ${grantIds.length} grant IDs for individual blob files`)

    // 2. Check which individual files exist (batched HEAD requests)
    const missingIds: string[] = []

    for (let i = 0; i < grantIds.length; i += BATCH_SIZE) {
        const batch = grantIds.slice(i, i + BATCH_SIZE)

        const results = await Promise.all(
            batch.map(async (id) => {
                const url = `${BLOB_BASE_URL}/pubmed/${pubmedFileName(id)}.json`
                try {
                    const response = await fetch(url, { method: 'HEAD' })
                    return { id, exists: response.ok }
                } catch {
                    return { id, exists: false }
                }
            })
        )

        for (const { id, exists } of results) {
            if (!exists) missingIds.push(id)
        }

        if (i > 0 && i % 500 === 0) {
            info(`Checked ${i}/${grantIds.length} files`)
        }
    }

    if (missingIds.length === 0) {
        info(`All ${grantIds.length} individual PubMed files exist`)
        return
    }

    info(`Found ${missingIds.length} missing files — re-fetching from PubMed`)

    // 3. Re-fetch missing files from Europe PMC and upload to blob
    const retryOptions: RetryOptions = { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 5000 }
    let repairedCount = 0
    let failedCount = 0

    for (let i = 0; i < missingIds.length; i++) {
        const id = missingIds[i]
        const result: PubMedLinkResult = await getPubMedLinks(id, retryOptions)

        if (result.success) {
            try {
                await put(`pubmed/${pubmedFileName(id)}.json`, JSON.stringify(result.publications), {
                    access: 'public',
                    addRandomSuffix: false,
                })
                repairedCount++
            } catch {
                warn(`Failed to upload blob for "${id}"`)
                failedCount++
            }
        } else {
            failedCount++
        }

        if ((i + 1) % 100 === 0) {
            info(`Repaired ${repairedCount} of ${missingIds.length} missing files`)
        }
    }

    info(`Audit complete: ${repairedCount} repaired, ${failedCount} failed out of ${missingIds.length} missing`)
}
