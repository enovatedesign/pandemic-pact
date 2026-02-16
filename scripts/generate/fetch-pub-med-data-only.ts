import dotenv from 'dotenv'
import downloadAndParseDataSheet from './download-and-parse-data-sheets'
import prepareGrants from './prepare-grants'
import fetchPubMedData from './fetch-pub-med-data'

(async () => {
    dotenv.config({ path: './.env.local' })

    const { useCachedFiles } = await downloadAndParseDataSheet(true)

    if (!useCachedFiles) {
        await prepareGrants()
    }

    await fetchPubMedData()
})()
