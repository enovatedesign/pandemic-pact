import fs from 'fs-extra'
import _ from 'lodash'
import { put } from '@vercel/blob'
import { ProcessedGrant, Grant } from '../types/generate'
import { title, info, printWrittenFileStats, warn } from '../helpers/log'

export default async function () {
    title('Fetching publication data from PubMed')

    const timeLogLabel = 'Fetched publication data from PubMed'

    console.time(timeLogLabel)

    if (process.env.SKIP_FETCHING_PUBMED_DATA) {
        warn(
            'Skipping PubMed data fetch because SKIP_FETCHING_PUBMED_DATA env var is present',
        )
        return
    }

    const grantsDistPathname = './data/dist/grants.json'

    const sourceGrants: ProcessedGrant[] = fs.readJsonSync(grantsDistPathname)

    // Fetch all the publications from PubMed that match the PubMed Grant IDs in our
    // dataset 
    const publications = await getPublications(
        sourceGrants.map(grant => grant.PubMedGrantId as string),
    )

    // Assign publications to each grant in our dataset
    const grants = sourceGrants.map((grant: Grant) => {
        const PubMedLinks = publications[grant.PubMedGrantId as string] ?? []

        return { ...grant, PubMedLinks }
    })

    fs.writeJsonSync(grantsDistPathname, grants)

    printWrittenFileStats(grantsDistPathname)

    console.timeEnd(timeLogLabel)
}

async function getPublications(pubMedGrantIds: string[]) {
    // Filter out invalid PubMed Grant IDs (such as null, '', 'unknown', 'not applicable')
    // and remove duplicates
    const grantIds = _.uniq(pubMedGrantIds.filter(idIsValidPubMedGrantId))

    // Try to get the publications from the cache first
    const cacheFilename = 'cached-pub-med-publications.json'

    const cacheUrl = `https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com/${cacheFilename}`

    const cacheResponse = await fetch(cacheUrl)

    if (!cacheResponse.ok && cacheResponse.status !== 404) {
        throw new Error(
            `Error fetching cached PubMed data: ${cacheResponse.status} ${cacheResponse.statusText}`,
        )
    }

    // If there is cached data and it has not expired, use that
    if (cacheResponse.ok) {
        const cache = await cacheResponse.json()

        // Note that if the source dataset has changed, it might have new PubMed Grant IDs
        // that are not in the cache, so we check that in addition to the expiration date
        if (cache.expiresAt && cache.publications) {
            const cachedGrantIds = Object.keys(cache.publications)

            // check if all grant IDs are in the cache
            const allIdsInCache = grantIds.every(id =>
                cachedGrantIds.includes(id),
            )

            // check expired date has not passed
            const cacheHasNotExpired = cache.expiresAt > Date.now()

            if (allIdsInCache && cacheHasNotExpired) {
                info('Using cached PubMed data')
                return cache.publications
            }
        }
    }

    info(
        'Cached PubMed data is not available or has expired, fetching new data via API',
    )

    // Fetch new PubMed data for each Grant ID
    const publications: { [key: string]: string } = {}

    for (let i = 0; i < grantIds.length; i++) {
        // Print the progress every 500 grants or at the end
        if (i > 0 && (i % 500 === 0 || i === grantIds.length - 1)) {
            info(`Fetched ${i}/${grantIds.length} PubMed publications`)
        }

        const id = grantIds[i]

        publications[id] = await getPubMedLinks(id)
    }

    // Cache the data for 1 week
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7 // 1 week

    // Store it at Vercel Blob
    await put(cacheFilename, JSON.stringify({ publications, expiresAt }), {
        access: 'public',
        addRandomSuffix: false,
    })

    info(
        `Stored PubMed data in cache file ${cacheFilename} until ${new Date(
            expiresAt,
        ).toLocaleString()}`,
    )

    return publications
}

function idIsValidPubMedGrantId(id?: string): boolean {
    if (typeof id !== 'string') {
        return false
    }

    return !['', 'unknown', 'not applicable'].includes(id.trim())
}

async function getPubMedLinks(pubMedGrantId: string) {
    const query = encodeURIComponent(`GRANT_ID:"${pubMedGrantId}"`)

    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=1000&query=${query}`

    const data = await fetch(url).then(response => response.json())

    if (!data.resultList) {
        info(`No PubMed resultList found in response from ${url}`)
        return []
    }

    return data.resultList.result
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
}
