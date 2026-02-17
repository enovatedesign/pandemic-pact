import fs from 'fs-extra'
import _ from 'lodash'
import { put } from '@vercel/blob'
import { Grant } from '../types/generate'
import { title, info, warn } from '../helpers/log'
import { streamLargeJson } from '../helpers/stream-io'
import { fetchWithRetry, RetryOptions } from '../helpers/pubmed-retry'

interface PubMedFetchMetadata {
    grants: {
        [grantId: string]: {
            lastChecked: string
            publicationCount: number
        }
    }
    lastRunStarted?: string
    lastRunCompleted?: string
}

interface PubMedLinkResult {
    publications: any[]
    success: boolean
}

export interface GetPublicationsOptions {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
    maxFailures?: number
    timeoutMs?: number
}

const FRESHNESS_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 7   // 7 days
const GRACE_PERIOD_MS = 1000 * 60 * 60 * 24 * 45          // 45 days
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 45          // 45 days (matches grace period)
const CHECKPOINT_INTERVAL = 100
export const CACHED_BUILD_TIMEOUT_MS = 1000 * 60 * 8       // 8 minutes

const BLOB_BASE_URL = process.env.BLOB_BASE_URL || 'https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com'
const CACHE_FILENAME = 'cached-pub-med-publications.json'
const METADATA_FILENAME = 'pubmed-fetch-metadata.json'

export default async function fetchPubMedData(options?: GetPublicationsOptions): Promise<Record<string, number>> {
    title('Fetching publication data from PubMed')

    const timeLogLabel = 'Fetched publication data from PubMed'

    console.time(timeLogLabel)

    if (process.env.SKIP_FETCHING_PUBMED_DATA) {
        warn(
            'Skipping PubMed data fetch because SKIP_FETCHING_PUBMED_DATA env var is present',
        )
        return {}
    }

    const zippedGrantsPath = './data/dist/grants.json.gz'

    const pubMedIds = new Set<string>();
    await streamLargeJson(zippedGrantsPath, (grant: Grant) => {
        if (idIsValidPubMedGrantId(String(grant.PubMedGrantId))) {
            pubMedIds.add(String(grant.PubMedGrantId));
        }
    });

    const publications = await getPublications(Array.from(pubMedIds), options);

    // Write individual PubMed files locally for dev (not needed on Vercel — production reads from blob storage)
    if (!process.env.VERCEL) {
        const pubmedOutputPath = './public/pubmed'
        fs.ensureDirSync(pubmedOutputPath)

        for (const [id, pubs] of Object.entries(publications)) {
            fs.writeJsonSync(`${pubmedOutputPath}/${pubmedFileName(id)}.json`, pubs)
        }

        info(`Wrote ${Object.keys(publications).length} individual PubMed files to ${pubmedOutputPath}`)
    }

    // Build publication counts for search indexing
    const counts: Record<string, number> = {}
    for (const [id, pubs] of Object.entries(publications)) {
        counts[id] = pubs.length
    }

    console.timeEnd(timeLogLabel)

    return counts
}

async function getPublications(pubMedGrantIds: string[], options?: GetPublicationsOptions) {
    const maxRetries = options?.maxRetries ?? 1
    const baseDelayMs = options?.baseDelayMs ?? 2000
    const maxDelayMs = options?.maxDelayMs ?? 2000
    const maxFailures = options?.maxFailures ?? 20
    const timeoutMs = options?.timeoutMs ?? 0

    const retryOptions: RetryOptions = { maxRetries, baseDelayMs, maxDelayMs }

    // Filter out invalid PubMed Grant IDs and remove duplicates
    const grantIds = _.uniq(pubMedGrantIds.filter(idIsValidPubMedGrantId))

    // Load existing publications cache
    let publications: { [key: string]: any[] } = {}

    try {
        const cacheResponse = await fetch(`${BLOB_BASE_URL}/${CACHE_FILENAME}`)

        if (cacheResponse.ok) {
            const cache = await cacheResponse.json()
            if (cache.publications) {
                publications = cache.publications
            }
        } else if (cacheResponse.status !== 404) {
            warn(`Error fetching cached PubMed data: ${cacheResponse.status} ${cacheResponse.statusText}`)
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        warn(`Failed to load PubMed publications cache: ${msg}`)
    }

    // Load per-grant metadata
    let metadata: PubMedFetchMetadata = { grants: {} }

    try {
        const metadataResponse = await fetch(`${BLOB_BASE_URL}/${METADATA_FILENAME}`)

        if (metadataResponse.ok) {
            metadata = await metadataResponse.json()
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        warn(`Failed to load PubMed fetch metadata: ${msg}`)
    }

    const now = Date.now()

    // Categorise grants by freshness
    const grantsToFetch: string[] = []
    let freshCount = 0

    for (const id of grantIds) {
        const meta = metadata.grants[id]
        const lastCheckedMs = meta?.lastChecked ? new Date(meta.lastChecked).getTime() : 0
        const age = now - lastCheckedMs
        const isFresh = age < FRESHNESS_THRESHOLD_MS
        const hasData = id in publications

        if (hasData && isFresh && !process.env.FETCH_PUBMED_DATA) {
            freshCount++
        } else {
            grantsToFetch.push(id)
        }
    }

    // Quick exit if all grants are fresh
    if (grantsToFetch.length === 0) {
        info(`All ${freshCount} grants have fresh PubMed data, using cache`)
        return filterToCurrentGrants(publications, grantIds, metadata, now)
    }

    info(`PubMed data: ${freshCount} fresh, ${grantsToFetch.length} to fetch`)

    // Fetch loop with checkpoints, circuit breaker, and timeout
    let failureCount = 0
    let refreshedCount = 0
    let cachedFallbackCount = 0
    let unavailableCount = 0
    let circuitBroken = false
    const fetchStartTime = Date.now()

    metadata.lastRunStarted = new Date().toISOString()

    for (let i = 0; i < grantsToFetch.length; i++) {
        // Circuit breaker check
        if (maxFailures > 0 && failureCount >= maxFailures) {
            warn(`PubMed API: ${failureCount} failures reached, skipping remaining ${grantsToFetch.length - i} grants to avoid blocking deployment`)
            circuitBroken = true
            break
        }

        // Timeout check
        if (timeoutMs > 0 && (Date.now() - fetchStartTime) >= timeoutMs) {
            warn(`PubMed fetch timeout (${Math.round(timeoutMs / 60000)} minutes) reached, skipping remaining ${grantsToFetch.length - i} grants`)
            circuitBroken = true
            break
        }

        if (i > 0 && (i % 500 === 0 || i === grantsToFetch.length - 1)) {
            info(`Fetched ${i}/${grantsToFetch.length} PubMed publications`)
        }

        const id = grantsToFetch[i]
        const result = await getPubMedLinks(id, retryOptions)

        if (result.success) {
            publications[id] = result.publications
            metadata.grants[id] = {
                lastChecked: new Date().toISOString(),
                publicationCount: result.publications.length,
            }
            refreshedCount++

            // Upload individual PubMed file to blob immediately
            // so partial results are live even if the build times out
            try {
                await put(`pubmed/${pubmedFileName(id)}.json`, JSON.stringify(result.publications), {
                    access: 'public',
                    addRandomSuffix: false,
                })
            } catch {
                // Non-fatal — consolidated cache is the fallback
            }
        } else {
            failureCount++
            // Keep existing cached data if within grace period
            const meta = metadata.grants[id]
            const lastCheckedMs = meta?.lastChecked ? new Date(meta.lastChecked).getTime() : 0
            const withinGrace = (now - lastCheckedMs) < GRACE_PERIOD_MS && id in publications

            if (withinGrace) {
                cachedFallbackCount++
            } else {
                publications[id] = []
                unavailableCount++
            }
        }

        // Save checkpoint periodically
        if ((i + 1) % CHECKPOINT_INTERVAL === 0) {
            await saveCheckpoint(publications, metadata, i + 1, grantsToFetch.length)
        }
    }

    // Count remaining grants that weren't fetched due to circuit breaker
    if (circuitBroken) {
        const skippedStartIndex = refreshedCount + failureCount
        for (let i = skippedStartIndex; i < grantsToFetch.length; i++) {
            const id = grantsToFetch[i]
            const meta = metadata.grants[id]
            const lastCheckedMs = meta?.lastChecked ? new Date(meta.lastChecked).getTime() : 0
            const withinGrace = (now - lastCheckedMs) < GRACE_PERIOD_MS && id in publications

            if (withinGrace) {
                cachedFallbackCount++
            } else {
                publications[id] = []
                unavailableCount++
            }
        }
    }

    // Log summary
    const oldestFallbackAge = getOldestFallbackAge(grantsToFetch, metadata, publications, now)
    const summaryParts = [
        `${freshCount} fresh`,
        `${refreshedCount} refreshed`,
    ]
    if (cachedFallbackCount > 0) {
        summaryParts.push(`${cachedFallbackCount} served from cache (up to ${oldestFallbackAge} days old)`)
    }
    if (unavailableCount > 0) {
        summaryParts.push(`${unavailableCount} unavailable`)
    }
    info(`PubMed data summary: ${summaryParts.join(', ')}`)

    // Final write
    const expiresAt = now + CACHE_EXPIRY_MS

    await put(CACHE_FILENAME, JSON.stringify({ publications, expiresAt }), {
        access: 'public',
        addRandomSuffix: false,
    })

    metadata.lastRunCompleted = new Date().toISOString()

    await put(METADATA_FILENAME, JSON.stringify(metadata), {
        access: 'public',
        addRandomSuffix: false,
    })

    info(`Stored PubMed data in cache until ${new Date(expiresAt).toLocaleString()}`)

    return filterToCurrentGrants(publications, grantIds, metadata, now)
}

/**
 * Filter publications to only include current grant IDs, and drop any
 * entries that have exceeded the grace period.
 */
function filterToCurrentGrants(
    publications: { [key: string]: any[] },
    grantIds: string[],
    metadata: PubMedFetchMetadata,
    now: number,
): { [key: string]: any[] } {
    const filtered: { [key: string]: any[] } = {}

    for (const id of grantIds) {
        if (!(id in publications)) {
            filtered[id] = []
            continue
        }

        const meta = metadata.grants[id]
        const lastCheckedMs = meta?.lastChecked ? new Date(meta.lastChecked).getTime() : 0
        const withinGrace = (now - lastCheckedMs) < GRACE_PERIOD_MS

        if (withinGrace) {
            filtered[id] = publications[id]
        } else {
            filtered[id] = []
        }
    }

    return filtered
}

function getOldestFallbackAge(
    grantIds: string[],
    metadata: PubMedFetchMetadata,
    publications: { [key: string]: any[] },
    now: number,
): number {
    let oldest = 0

    for (const id of grantIds) {
        const meta = metadata.grants[id]
        if (!meta?.lastChecked || !(id in publications)) continue

        const age = now - new Date(meta.lastChecked).getTime()
        if (age > FRESHNESS_THRESHOLD_MS && age < GRACE_PERIOD_MS) {
            oldest = Math.max(oldest, age)
        }
    }

    return Math.ceil(oldest / (1000 * 60 * 60 * 24))
}

async function saveCheckpoint(
    publications: { [key: string]: any[] },
    metadata: PubMedFetchMetadata,
    fetchProgress: number,
    fetchTotal: number,
): Promise<void> {
    try {
        const expiresAt = Date.now() + CACHE_EXPIRY_MS

        await put(
            CACHE_FILENAME,
            JSON.stringify({ publications, expiresAt }),
            { access: 'public', addRandomSuffix: false },
        )

        await put(
            METADATA_FILENAME,
            JSON.stringify(metadata),
            { access: 'public', addRandomSuffix: false },
        )

        info(`Checkpoint saved (${fetchProgress}/${fetchTotal} fetched)`)
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        warn(`Failed to save checkpoint: ${msg}`)
    }
}

function pubmedFileName(id: string): string {
    return id.replace(/\//g, '__')
}

function idIsValidPubMedGrantId(id?: string): boolean {
    if (typeof id !== 'string') {
        return false
    }

    const normalised = id.trim().toLowerCase()
    return !['', 'unknown', 'not applicable', 'n/a'].includes(normalised)
}

async function getPubMedLinks(pubMedGrantId: string, retryOptions: RetryOptions): Promise<PubMedLinkResult> {
    const query = encodeURIComponent(`GRANT_ID:"${pubMedGrantId}"`)
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=1000&query=${query}`

    try {
        const response = await fetchWithRetry(url, retryOptions)
        const data = await response.json()

        if (!data.resultList) {
            info(`No PubMed resultList found in response from ${url}`)
            return { publications: [], success: true }
        }

        const publications = data.resultList.result
            .map((result: any) =>
                _.pick(result, [
                    'title',
                    'source',
                    'pmid',
                    'authorString',
                    'doi',
                    'pubYear',
                    'journalInfo.journal.title',
                ]),
            )
            .map((result: any) => ({
                ...result,
                updated_at: new Date().toISOString(),
            }))

        return { publications, success: true }
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        warn(`Failed to fetch PubMed links for grant ${pubMedGrantId}: ${msg}`)
        return { publications: [], success: false }
    }
}
