import dotenv from 'dotenv'
import downloadAndParseDataSheets from './download-and-parse-data-sheets'
import prepareSelectOptions from './prepare-select-options'
import prepareGrants from './prepare-grants'
import prepareHomepageTotals from './prepare-homepage-totals'
import fetchPubMedData from './fetch-pub-med-data'
import prepareIndividualGrantFiles from './prepare-individual-grant-files'
import prepareCsvExportFile from './prepare-csv-export-file'
import prepareSearch from './prepare-search'

main()

async function main() {
    dotenv.config({ path: './.env.local' })

    await downloadAndParseDataSheets()

    prepareSelectOptions()

    prepareGrants()

    prepareHomepageTotals()

    await fetchPubMedData()

    prepareIndividualGrantFiles()

    prepareCsvExportFile()

    await prepareSearch()
}
