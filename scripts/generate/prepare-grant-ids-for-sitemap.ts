import fs from 'fs-extra'
import { printWrittenFileStats, title } from "../helpers/log"
import { ProcessedGrant } from "../types/generate"
import readGrantsDist from "../helpers/read-grants-dist"

export default async function prepareGrantIdsForSitemap() {
    title('Preparing sitemap grant file')

    const sourceGrants: ProcessedGrant[] = readGrantsDist()
        
    const grantIds = sourceGrants.map(grant => grant['GrantID'])

    const pathname = './public/data/grant-ids.json'
    
    fs.writeJsonSync(pathname, grantIds)

    printWrittenFileStats(pathname)
} 