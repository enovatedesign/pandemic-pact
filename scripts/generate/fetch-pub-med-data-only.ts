import dotenv from 'dotenv'
import fs from 'fs-extra'
import zlib from 'zlib'
import downloadAndParseDataSheet from './download-and-parse-data-sheets'
import prepareGrants from './prepare-grants'
import fetchPubMedData from './fetch-pub-med-data'

(async () => {
    dotenv.config({ path: './.env.local' })

    const { useCachedFiles } = await downloadAndParseDataSheet(true)

    if (useCachedFiles) {
        // Blob cache provides already-processed grants at ./public/data/grants.json
        // but fetchPubMedData() expects ./data/dist/grants.json.gz
        // Gzip the cached file to the expected location
        fs.ensureDirSync('./data/dist')
        const data = fs.readFileSync('./public/data/grants.json')
        fs.writeFileSync('./data/dist/grants.json.gz', new Uint8Array(zlib.gzipSync(data as any)))
    } else {
        await prepareGrants()
    }

    await fetchPubMedData()
})()
