import downloadAndParseDataSheet from './download-and-parse-data-sheets'
import prepareGrants from './prepare-grants'
import fetchPubMedData from './fetch-pub-med-data'

(async () => {
    await downloadAndParseDataSheet(true)

    await prepareGrants()

    await fetchPubMedData()
})()
