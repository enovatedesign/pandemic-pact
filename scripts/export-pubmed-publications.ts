/**
 * One-off export: flatten every grant's PubMed publications into a single
 * CSV or JSON file, with one row per (grant, publication) pair.
 *
 * Source: the consolidated PubMed cache blob (`cached-pub-med-publications.json`),
 * which mirrors the per-grant `pubmed/{encoded}.json` files the site renders.
 *
 * Usage:
 *   npm run export-pubmed-publications           # writes CSV
 *   npm run export-pubmed-publications -- --format=json
 *
 * Output: data/dump/pubmed-publications-export.{csv,json}
 */

import dotenv from 'dotenv'
import fs from 'fs-extra'

import { streamLargeJson } from './helpers/stream-io'
import { title, info, warn } from './helpers/log'
import { Grant } from './types/generate'
import { splitGrantIds, idIsValidPubMedGrantId } from '../app/helpers/pubmed-ids'

const BLOB_BASE_URL =
    process.env.BLOB_BASE_URL ||
    'https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com'

const CACHE_FILENAME = 'cached-pub-med-publications.json'
const GRANTS_PATH = './data/dist/grants.json.gz'
const OUTPUT_DIR = './data/dump'

type Publication = {
    id?: string
    title?: string
    source?: string
    pmid?: string
    authorString?: string
    doi?: string
    pubYear?: string
    journalInfo?: { journal?: { title?: string } }
    updated_at?: string
}

type OutputRow = {
    GrantID: string
    PubMedGrantId: string
    pmid: string
    publicationId: string
    title: string
    authors: string
    journal: string
    pubYear: string
    doi: string
    europePmcUrl: string
    pubmedUrl: string
    updatedAt: string
}

const COLUMNS: (keyof OutputRow)[] = [
    'GrantID',
    'PubMedGrantId',
    'pmid',
    'publicationId',
    'title',
    'authors',
    'journal',
    'pubYear',
    'doi',
    'europePmcUrl',
    'pubmedUrl',
    'updatedAt',
]

function europePmcUrl(pub: Publication): string {
    const id = pub.pmid || pub.id
    if (!pub.source || !id) return ''
    return `https://europepmc.org/article/${pub.source}/${id}`
}

function pubmedUrl(pub: Publication): string {
    if (!pub.pmid) return ''
    return `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`
}

function csvEscape(value: string | undefined): string {
    if (value == null) return ''
    const s = String(value)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
}

function rowToPublication(grantId: string, pubMedGrantId: string, pub: Publication): OutputRow {
    return {
        GrantID: grantId,
        PubMedGrantId: pubMedGrantId,
        pmid: pub.pmid ?? '',
        publicationId: pub.id ?? '',
        title: pub.title ?? '',
        authors: pub.authorString ?? '',
        journal: pub.journalInfo?.journal?.title ?? '',
        pubYear: pub.pubYear ?? '',
        doi: pub.doi ?? '',
        europePmcUrl: europePmcUrl(pub),
        pubmedUrl: pubmedUrl(pub),
        updatedAt: pub.updated_at ?? '',
    }
}

;(async () => {
    dotenv.config({ path: './.env.local' })

    title('Exporting PubMed publications to a single file')

    const formatArg = process.argv
        .slice(2)
        .find(a => a.startsWith('--format='))
        ?.split('=')[1]
    const format: 'csv' | 'json' = formatArg === 'json' ? 'json' : 'csv'

    info(`Loading consolidated PubMed cache from ${BLOB_BASE_URL}/${CACHE_FILENAME}`)

    const cacheResponse = await fetch(`${BLOB_BASE_URL}/${CACHE_FILENAME}`)

    if (!cacheResponse.ok) {
        throw new Error(
            `Failed to load PubMed cache: ${cacheResponse.status} ${cacheResponse.statusText}`,
        )
    }

    const cache = (await cacheResponse.json()) as {
        publications?: { [pubMedGrantId: string]: Publication[] }
    }

    const publicationsByPubMedGrantId = cache.publications ?? {}
    const cacheKeyCount = Object.keys(publicationsByPubMedGrantId).length

    info(`Cache holds publications for ${cacheKeyCount} PubMed Grant IDs`)

    if (!fs.existsSync(GRANTS_PATH)) {
        throw new Error(
            `Grants file not found at ${GRANTS_PATH}. Run \`npm run generate\` first ` +
            `to produce the local grants.json.gz.`,
        )
    }

    const pairs: { GrantID: string; PubMedGrantId: string }[] = []

    await streamLargeJson(GRANTS_PATH, (grant: Grant) => {
        const grantId = String(grant.GrantID ?? '').trim()
        const rawPubMedGrantId = String(grant.PubMedGrantId ?? '').trim()
        if (!grantId || !rawPubMedGrantId) return

        for (const part of splitGrantIds(rawPubMedGrantId)) {
            if (idIsValidPubMedGrantId(part)) {
                pairs.push({ GrantID: grantId, PubMedGrantId: part })
            }
        }
    })

    info(`Found ${pairs.length} (GrantID, PubMedGrantId) pairs across all grants`)

    const rows: OutputRow[] = []
    let pairsWithPublications = 0
    let pairsWithoutPublications = 0
    let missingFromCache = 0

    for (const { GrantID, PubMedGrantId } of pairs) {
        const pubs = publicationsByPubMedGrantId[PubMedGrantId]

        if (!pubs) {
            missingFromCache++
            continue
        }

        if (pubs.length === 0) {
            pairsWithoutPublications++
            continue
        }

        pairsWithPublications++
        for (const pub of pubs) {
            rows.push(rowToPublication(GrantID, PubMedGrantId, pub))
        }
    }

    info(
        `Result: ${rows.length} publication rows | ` +
        `${pairsWithPublications} pairs with pubs, ` +
        `${pairsWithoutPublications} empty in cache, ` +
        `${missingFromCache} missing from cache`,
    )

    if (missingFromCache > 0) {
        warn(
            `${missingFromCache} PubMedGrantIds referenced by grants are not present ` +
            `in the consolidated cache. They may be new grants whose PubMed data has ` +
            `not yet been fetched, or invalid IDs that were filtered upstream.`,
        )
    }

    fs.ensureDirSync(OUTPUT_DIR)

    if (format === 'json') {
        const outputPath = `${OUTPUT_DIR}/pubmed-publications-export.json`
        fs.writeJsonSync(outputPath, rows, { spaces: 2 })
        info(`Wrote ${rows.length} rows to ${outputPath}`)
    } else {
        const outputPath = `${OUTPUT_DIR}/pubmed-publications-export.csv`
        const lines: string[] = [COLUMNS.join(',')]
        for (const row of rows) {
            lines.push(COLUMNS.map(col => csvEscape(row[col])).join(','))
        }
        fs.writeFileSync(outputPath, lines.join('\n') + '\n')
        info(`Wrote ${rows.length} rows to ${outputPath}`)
    }
})().catch(err => {
    console.error(err)
    process.exit(1)
})
