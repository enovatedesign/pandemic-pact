import dotenv from 'dotenv'
import downloadAndParseDataSheets from './download-and-parse-data-sheets'
import prepareGrants from './prepare-grants'
import prepareSelectOptions from './prepare-select-options'
import prepareHomepageTotals from './prepare-homepage-totals'
import fetchPubMedData from './fetch-pub-med-data'
import prepareIndividualGrantFiles from './prepare-individual-grant-files'
import prepareVisualisePageGrantsFile from './prepare-visualise-page-grants-file'
import prepareCsvExportFile from './prepare-csv-export-file'
import prepareMap from './prepare-map'
import prepareSearch from './prepare-search'

main()

async function main() {
    dotenv.config({ path: './.env.local' })

    await downloadAndParseDataSheets()

    prepareGrants()

    prepareSelectOptions()

    prepareHomepageTotals()

    await fetchPubMedData()

    prepareIndividualGrantFiles()

    prepareVisualisePageGrantsFile()

    prepareCsvExportFile()

    prepareMap()

    await prepareSearch()
}
