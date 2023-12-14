import fs from 'fs-extra'
import _ from 'lodash'
import {kv} from "@vercel/kv"
import {ProcessedGrant, Grant} from '../types/generate'
import {title, info, printWrittenFileStats, warn} from '../helpers/log.mjs'

export default async function () {
    title('Fetching publication data from PubMed')

    if (process.env.SKIP_FETCHING_PUBMED_DATA) {
        warn('Skipping PubMed data fetch because SKIP_FETCHING_PUBMED_DATA env var is present')
        return
    }

    const pathname = './data/dist/grants.json'

    const sourceGrants: ProcessedGrant[] = fs.readJsonSync(pathname)

    const grants: Grant[] = []

    for (let i = 0; i < sourceGrants.length; i++) {
        const sourceGrant = sourceGrants[i]

        if (i > 0 && (i % 500 === 0 || i === sourceGrants.length - 1)) {
            info(`Fetched publications for ${i}/${sourceGrants.length} grants`)
        }

        if (grantHasValidPubMedId(sourceGrant)) {
            const PubMedLinks = await getPubMedLinks(sourceGrant.PubMedGrantId as string)
            grants.push({...sourceGrant, PubMedLinks})
        } else {
            grants.push(sourceGrant)
        }
    }

    fs.writeJsonSync(pathname, grants)

    printWrittenFileStats(pathname)
}

function grantHasValidPubMedId(grant: ProcessedGrant): boolean {
    if (!grant.PubMedGrantId) {
        return false
    }

    const id = grant.PubMedGrantId as string

    return !['', 'unknown', 'not applicable'].includes(id.trim())
}

async function getPubMedLinks(pubMedGrantId: string) {
    const kvKey = `pub-med-${pubMedGrantId}`

    const value = await kv.get(kvKey)

    if (value) {
        return value
    }

    const query = encodeURIComponent(`GRANT_ID:"${pubMedGrantId}"`)

    const data = await fetch(
        `https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=1000&query=${query}`
    ).then(response => response.json())

    const results = data.resultList.result.map(
        (result: any) => _.pick(result, [
            'title',
            'source',
            'pmid',
            'authorString',
            'doi',
            'pubYear',
            'journalInfo.journal.title',
        ])
    )

    const oneWeekInSeconds = 60 * 60 * 24 * 7

    // The third argument is an object of Redis SET options, which are documented here:
    // https://redis.io/commands/set
    await kv.set(
        kvKey,
        results,
        {ex: oneWeekInSeconds, nx: true},
    )

    return results
}
