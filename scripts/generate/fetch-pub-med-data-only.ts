import dotenv from 'dotenv'
import downloadAndParseDataSheet from './download-and-parse-data-sheets'
import prepareGrants from './prepare-grants'
import prepareSelectOptions from './prepare-select-options'
import fetchPubMedData from './fetch-pub-med-data'
import prepareSearch from './prepare-search'

(async () => {
    dotenv.config({ path: './.env.local' })

    const { useCachedFiles } = await downloadAndParseDataSheet(true)

    // On the fresh path, regenerate grants + select-options (which prepareSearch
    // reads). On the cached path both are restored from S3, and the raw
    // data/download/dictionary.json that prepareSelectOptions needs is NOT
    // downloaded — so only run these when we actually fetched fresh data.
    if (!useCachedFiles) {
        await prepareGrants()
        await prepareSelectOptions()
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
    // place the OpenSearch PublicationCount is refreshed.
    await prepareSearch(publicationCounts)
})()
