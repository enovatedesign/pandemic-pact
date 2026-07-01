import dotenv from 'dotenv'
import downloadAndParseDataSheet from './download-and-parse-data-sheets'
import prepareGrants from './prepare-grants'
import prepareSelectOptions from './prepare-select-options'
import fetchPubMedData from './fetch-pub-med-data'
import prepareSearch from './prepare-search'

(async () => {
    dotenv.config({ path: './.env.local' })

    const { useCachedFiles } = await downloadAndParseDataSheet(true)

    if (!useCachedFiles) {
        await prepareGrants()
    }

    // CI environment has no meaningful timeout, so use aggressive retry
    // with exponential backoff and no circuit breaker
    const publicationCounts = await fetchPubMedData({
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        maxFailures: 0,
    })

    // Deploy builds no longer fetch PubMed, so this weekly job is now the only
    // place the OpenSearch PublicationCount is refreshed. prepareSearch reads
    // ./data/dist/select-options.json, so make sure it exists before indexing.
    await prepareSelectOptions()

    await prepareSearch(publicationCounts)
})()
