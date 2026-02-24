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
 * 1. Checks whether each individual blob file exists and is in sync with
 *    the consolidated cache. Missing files are re-fetched from Europe PMC.
 * 2. Checks for publications with broken identifiers (e.g. PPR preprints
 *    missing their `id` field) and re-fetches those grants too.
 * 3. Detects cache entries that are out of sync with individual blob files
 *    and updates the consolidated cache to match.
 * 4. Writes all changes back to the consolidated cache.
 */
export async function auditPubmedBlobs(localPublications?: { [key: string]: any[] }): Promise<void> {
    title('Auditing individual PubMed blob files')

    // 1. Load consolidated cache to get the full list of grant IDs
    let cache: { publications: { [key: string]: any[] }; expiresAt?: number }

    try {
        const cacheResponse = await fetch(`${BLOB_BASE_URL}/${CACHE_FILENAME}`)

        if (!cacheResponse.ok) {
            warn(`Cannot load consolidated PubMed cache: ${cacheResponse.status} ${cacheResponse.statusText}`)
            return
        }

        cache = await cacheResponse.json()

        if (!cache.publications) {
            warn('Consolidated cache has no publications key')
            return
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        warn(`Failed to load consolidated PubMed cache: ${msg}`)
        return
    }

    // Only check grants that actually have publications
    const grantIds = Object.entries(cache.publications)
        .filter(([_, pubs]) => Array.isArray(pubs) && (pubs as any[]).length > 0)
        .map(([id]) => id)

    info(`Checking ${grantIds.length} grant IDs with publications`)

    // 2. Fetch individual blob files and compare with cache (batched GET requests)
    const missingIds: string[] = []
    const outOfSyncGrants: { id: string; publications: any[] }[] = []

    for (let i = 0; i < grantIds.length; i += BATCH_SIZE) {
        const batch = grantIds.slice(i, i + BATCH_SIZE)

        const results = await Promise.all(
            batch.map(async (id) => {
                const url = `${BLOB_BASE_URL}/pubmed/${pubmedFileName(id)}.json`
                try {
                    const response = await fetch(url)
                    if (!response.ok) return { id, status: 'missing' as const }

                    const blobPubs: any[] = await response.json()
                    const cachePubs = cache.publications[id]
                    const cacheCount = Array.isArray(cachePubs) ? cachePubs.length : 0

                    if (blobPubs.length !== cacheCount) {
                        return { id, status: 'out_of_sync' as const, publications: blobPubs }
                    }

                    return { id, status: 'ok' as const }
                } catch {
                    return { id, status: 'missing' as const }
                }
            })
        )

        for (const result of results) {
            if (result.status === 'missing') {
                missingIds.push(result.id)
            } else if (result.status === 'out_of_sync') {
                outOfSyncGrants.push({ id: result.id, publications: result.publications })
            }
        }

        if (i > 0 && i % 500 === 0) {
            info(`Checked ${i}/${grantIds.length} files`)
        }
    }

    info(`Found ${missingIds.length} missing files, ${outOfSyncGrants.length} out of sync with cache`)

    // 3. Find grants with broken publication identifiers (e.g. PPR preprints missing `id`)
    const skipIds = new Set([...missingIds, ...outOfSyncGrants.map(g => g.id)])
    const brokenIds: string[] = []

    for (const [grantId, pubs] of Object.entries(cache.publications)) {
        if (skipIds.has(grantId)) continue
        if (!Array.isArray(pubs)) continue

        const hasBrokenLink = pubs.some(
            (pub: any) => pub.source === 'PPR' && !pub.id
        )

        if (hasBrokenLink) {
            brokenIds.push(grantId)
        }
    }

    if (brokenIds.length > 0) {
        info(`Found ${brokenIds.length} grants with broken publication links`)
    }

    // 4. Sync out-of-sync cache entries (no PubMed re-fetch needed, blob file is correct)
    let cacheUpdated = false

    if (outOfSyncGrants.length > 0) {
        for (const { id, publications } of outOfSyncGrants) {
            cache.publications[id] = publications
            if (localPublications && id in localPublications) {
                localPublications[id] = publications
            }
        }
        cacheUpdated = true
        info(`Synced ${outOfSyncGrants.length} out-of-sync cache entries from individual blob files`)
    }

    // 5. Re-fetch missing and broken files from Europe PMC
    const idsToRepair = [...missingIds, ...brokenIds]

    if (idsToRepair.length === 0 && !cacheUpdated) {
        info(`All ${grantIds.length} individual PubMed files are present, valid, and in sync`)
        return
    }

    if (idsToRepair.length > 0) {
        info(`Re-fetching ${idsToRepair.length} grants from PubMed (${missingIds.length} missing, ${brokenIds.length} broken)`)

        const retryOptions: RetryOptions = { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 5000 }
        let repairedCount = 0
        let failedCount = 0

        for (let i = 0; i < idsToRepair.length; i++) {
            const id = idsToRepair[i]
            const result: PubMedLinkResult = await getPubMedLinks(id, retryOptions)

            if (result.success) {
                try {
                    await put(`pubmed/${pubmedFileName(id)}.json`, JSON.stringify(result.publications), {
                        access: 'public',
                        addRandomSuffix: false,
                    })
                    cache.publications[id] = result.publications
                    if (localPublications && id in localPublications) {
                        localPublications[id] = result.publications
                    }
                    cacheUpdated = true
                    repairedCount++
                } catch {
                    warn(`Failed to upload blob for "${id}"`)
                    failedCount++
                }
            } else {
                failedCount++
            }

            if ((i + 1) % 100 === 0) {
                info(`Repaired ${repairedCount} of ${idsToRepair.length} grants`)
            }
        }

        info(`Re-fetch complete: ${repairedCount} repaired, ${failedCount} failed out of ${idsToRepair.length} total`)
    }

    // 6. Write updated consolidated cache
    if (cacheUpdated) {
        try {
            await put(CACHE_FILENAME, JSON.stringify(cache), {
                access: 'public',
                addRandomSuffix: false,
            })
            info('Updated consolidated cache')
        } catch {
            warn('Failed to update consolidated cache')
        }
    }
}
