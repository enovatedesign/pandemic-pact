import fs from 'fs-extra'
import _ from 'lodash'
import {ProcessedGrant, Grant} from '../types/generate'
import {title, info, printWrittenFileStats} from '../helpers/log.mjs'

export default async function () {
    title('Fetching publication data from PubMed')

    const pathname = './data/dist/grants.json'

    const sourceGrants: ProcessedGrant[] = await fs.readJson(pathname)

    const grants: Grant[] = []

    for (let i = 0; i < sourceGrants.length; i++) {
        const sourceGrant = sourceGrants[i]

        if (i > 0 && (i % 500 === 0 || i === sourceGrants.length - 1)) {
            info(`Fetched publications for ${i}/${sourceGrants.length} grants`)
        }

        if (grantHasValidPubmedId(sourceGrant)) {
            const PubMedLinks = await getPubMedLinks(sourceGrant.PubMedGrantId as string)
            grants.push({...sourceGrant, PubMedLinks})
        } else {
            grants.push(sourceGrant)
        }
    }

    fs.writeJsonSync(pathname, grants)

    printWrittenFileStats(pathname)
}

function grantHasValidPubmedId(grant: ProcessedGrant): boolean {
    if (!grant.PubMedGrantId) {
        return false
    }

    const id = grant.PubMedGrantId as string

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
    )
}
