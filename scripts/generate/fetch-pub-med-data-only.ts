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

    // CI environment has no meaningful timeout, so use aggressive retry
    // with exponential backoff and no circuit breaker
    await fetchPubMedData({
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        maxFailures: 0,
    })
})()
