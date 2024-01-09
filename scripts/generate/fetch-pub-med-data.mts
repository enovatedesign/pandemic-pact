import fs from 'fs-extra'
import _ from 'lodash'
import {put} from "@vercel/blob"
import {ProcessedGrant, Grant} from '../types/generate'
import {title, info, printWrittenFileStats, warn} from '../helpers/log.mjs'

export default async function () {
    title('Fetching publication data from PubMed')

    if (process.env.SKIP_FETCHING_PUBMED_DATA) {
        warn('Skipping PubMed data fetch because SKIP_FETCHING_PUBMED_DATA env var is present')
        return
    }

    const grantsDistPathname = './data/dist/grants.json'

    const sourceGrants: ProcessedGrant[] = fs.readJsonSync(grantsDistPathname)

    const publications = await getPublications(
        sourceGrants.map(grant => grant.PubMedGrantId as string)
    )

    const grants = sourceGrants.map((grant: Grant) => {
        const PubMedLinks = publications[grant.PubMedGrantId as string] ?? []

        return {...grant, PubMedLinks}
    })

    fs.writeJsonSync(grantsDistPathname, grants)

    printWrittenFileStats(grantsDistPathname)
}

async function getPublications(pubMedGrantIds: string[]) {
    const grantIds = _.uniq(
        pubMedGrantIds.filter(idIsValidPubMedGrantId)
    )

    const cacheFilename = 'cached-pub-med-publications.json';

    const cacheUrl = `https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com/${cacheFilename}`

    const cacheResponse = await fetch(cacheUrl)

    if (!cacheResponse.ok && cacheResponse.status !== 404) {
        throw new Error(`Error fetching cached PubMed data: ${cacheResponse.status} ${cacheResponse.statusText}`)
    }

    if (cacheResponse.ok) {
        const cache = await cacheResponse.json()

        if (cache.expiresAt && cache.publications) {
            const cachedGrantIds = Object.keys(cache.publications)

            // check if all grant IDs are in the cache
            const allIdsInCache = grantIds.every(id => cachedGrantIds.includes(id))

            // check expired date has not passed
            const cacheHasNotExpired = cache.expiresAt > Date.now()

            if (allIdsInCache && cacheHasNotExpired) {
                info('Using cached PubMed data')
                return cache.publications
            }
        }
    }

    info('Cached PubMed data is not available or has expired, fetching new data via API')

    // Fetch new PubMed data for each Grant ID
    const publications: {[key: string]: string} = {}

    for (let i = 0; i < grantIds.length; i++) {
        if (i > 0 && (i % 500 === 0 || i === grantIds.length - 1)) {
            info(`Fetched ${i}/${grantIds.length} PubMed publications`)
        }

        const id = grantIds[i]

        publications[id] = await getPubMedLinks(id)
    }

    // Cache the data for 1 week
    const expiresAt = Date.now() + (1000 * 60 * 60 * 24 * 7) // 1 week

    // Store it at Vercel Blob
    await put(
        cacheFilename,
        JSON.stringify({publications, expiresAt}),
        {access: 'public', addRandomSuffix: false}
    )

    info(`Stored PubMed data in cache file ${cacheFilename} until ${new Date(expiresAt).toLocaleString()}`)

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

    const data = await fetch(
        `https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=1000&query=${query}`
    ).then(response => response.json())

    return data.resultList.result.map(
        (result: any) => _.pick(result, [
            'title',
            'source',
            'pmid',
            'authorString',
            'doi',
            'pubYear',
            'journalInfo.journal.title',
        ])
    ).map((result: any) => ({
        ...result,
        updated_at: new Date().toISOString(),
    }))
}
