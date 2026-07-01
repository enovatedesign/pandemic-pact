/**
 * One-time migration of PubMed data from Vercel Blob → Amazon S3.
 *
 * Deploy builds no longer fetch PubMed (only the weekly job does), so when an
 * environment flips to STORAGE_BACKEND=s3 the runtime reads pubmed/* from S3 —
 * which is empty until the weekly job has run against S3. This copies the
 * existing PubMed data across from Blob so publications keep working immediately,
 * WITHOUT re-fetching from Europe PMC.
 *
 * It reads the Blob consolidated cache (which already contains every grant's
 * publications) and writes to S3:
 *   - pubmed/{id}.json          one per grant (served at runtime)
 *   - cached-pub-med-publications.json   the consolidated cache (no-store)
 *   - pubmed-fetch-metadata.json          (no-store, if present)
 *
 * Source = Blob, destination = S3, regardless of STORAGE_BACKEND. Requires
 * BLOB_BASE_URL (source) and S3_BUCKET / AWS_REGION / AWS credentials (dest).
 *
 * Usage:
 *   npm run migrate-pubmed-to-s3 -- --dry-run   # preview counts, no writes
 *   npm run migrate-pubmed-to-s3                 # perform the copy
 */
import dotenv from 'dotenv'
import { pubmedFileName } from '../app/helpers/pubmed-ids'
import { s3PutObject, mapWithConcurrency } from './helpers/s3-client'
import { title, info, warn } from './helpers/log'

const CACHE_FILENAME = 'cached-pub-med-publications.json'
const METADATA_FILENAME = 'pubmed-fetch-metadata.json'

;(async () => {
    dotenv.config({ path: './.env.local' })

    const dryRun = process.argv.includes('--dry-run')

    title('Migrating PubMed data from Vercel Blob to S3')

    const blobBaseUrl = process.env.BLOB_BASE_URL
    if (!blobBaseUrl) throw new Error('BLOB_BASE_URL not set (migration source)')
    if (!process.env.S3_BUCKET) throw new Error('S3_BUCKET not set (migration destination)')

    info(`Source (Blob): ${blobBaseUrl}`)
    info(`Destination (S3): bucket "${process.env.S3_BUCKET}" in ${process.env.AWS_REGION}`)
    if (dryRun) info('DRY RUN — no writes will be made')

    // 1. Read the consolidated cache from Blob (has every grant's publications)
    info(`Reading ${CACHE_FILENAME} from Blob...`)
    const cacheRes = await fetch(`${blobBaseUrl}/${CACHE_FILENAME}`)
    if (!cacheRes.ok) {
        throw new Error(`Failed to read consolidated cache from Blob: ${cacheRes.status} ${cacheRes.statusText}`)
    }
    const cacheBody = await cacheRes.text()
    const cache = JSON.parse(cacheBody) as {
        publications?: Record<string, any[]>
        expiresAt?: number
    }
    const publications = cache.publications ?? {}
    const ids = Object.keys(publications)
    info(`Consolidated cache has ${ids.length} grant entries`)

    // 2. Read metadata from Blob (optional)
    let metadataBody: string | null = null
    const metaRes = await fetch(`${blobBaseUrl}/${METADATA_FILENAME}`)
    if (metaRes.ok) {
        metadataBody = await metaRes.text()
        info(`Read ${METADATA_FILENAME} from Blob`)
    } else {
        warn(`No ${METADATA_FILENAME} in Blob (${metaRes.status}) — migrating cache + per-grant files only`)
    }

    if (dryRun) {
        info(
            `DRY RUN: would write ${ids.length} pubmed/*.json files + ${CACHE_FILENAME}` +
            `${metadataBody ? ` + ${METADATA_FILENAME}` : ''} to S3.`,
        )
        return
    }

    // 3. Write per-grant files to S3 (root-level keys, not branch-scoped)
    let written = 0
    const errors: string[] = []

    await mapWithConcurrency(ids, 64, async id => {
        const key = `pubmed/${pubmedFileName(id)}.json`
        try {
            await s3PutObject(key, JSON.stringify(publications[id]))
            written++
            if (written % 1000 === 0 || written === ids.length) {
                info(`Wrote ${written}/${ids.length} per-grant PubMed files to S3`)
            }
        } catch (e) {
            errors.push(`${id}: ${e instanceof Error ? e.message : String(e)}`)
        }
    })

    // 4. Write consolidated cache + metadata (no-store, matching the weekly job)
    await s3PutObject(CACHE_FILENAME, cacheBody, 'application/json', 'no-store')
    info(`Wrote ${CACHE_FILENAME} to S3`)

    if (metadataBody) {
        await s3PutObject(METADATA_FILENAME, metadataBody, 'application/json', 'no-store')
        info(`Wrote ${METADATA_FILENAME} to S3`)
    }

    if (errors.length > 0) {
        warn(`${errors.length} per-grant files failed to upload:`)
        errors.slice(0, 10).forEach(e => warn(`  ${e}`))
        if (errors.length / Math.max(ids.length, 1) > 0.01) {
            throw new Error(`Too many failures (${errors.length}/${ids.length}). Aborting.`)
        }
    }

    info(
        `✓ Migration complete: ${written} per-grant files + consolidated cache` +
        `${metadataBody ? ' + metadata' : ''} now in S3.`,
    )
})().catch(e => {
    console.error('\n✗ Migration failed:', e)
    process.exit(1)
})
