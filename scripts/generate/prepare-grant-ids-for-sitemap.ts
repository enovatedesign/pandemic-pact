import fs from 'fs-extra'
import zlib from 'zlib'
import { printWrittenFileStats, title } from "../helpers/log"
import { ProcessedGrant } from "../types/generate"

export default async function prepareGrantIdsForSitemap() {
    title('Preparing sitemap grant file')
    
    const zippedGrantsPath = './data/dist/grants.json.gz'
    const gzipBuffer = fs.readFileSync(zippedGrantsPath)
    const jsonBuffer = zlib.gunzipSync(gzipBuffer as any)
    const sourceGrants: ProcessedGrant[] = JSON.parse(jsonBuffer.toString())
        
    const grantIds = sourceGrants.map(grant => grant['GrantID'])

    const pathname = './public/data/grant-ids.json'
    
    fs.writeJsonSync(pathname, grantIds)

    printWrittenFileStats(pathname)
} 