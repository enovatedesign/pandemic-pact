import dotenv from 'dotenv'
import downloadAndParseDataSheets from './download-and-parse-data-sheets.mjs'
import prepareSelectOptions from './prepare-select-options.mjs'
import prepareGrants from './prepare-grants.mjs'
import prepareHomepageTotals from './prepare-homepage-totals.mjs'
import fetchPubMedData from './fetch-pub-med-data.mjs'
import prepareIndividualGrantFiles from './prepare-individual-grant-files.mjs'
import prepareMeilisearch from './prepare-meilisearch.mjs'

main()

async function main() {
    dotenv.config({path: './.env.local'})

    await downloadAndParseDataSheets()

    prepareSelectOptions()

    prepareGrants()

    prepareHomepageTotals()

    await fetchPubMedData()

    prepareIndividualGrantFiles()

    await prepareMeilisearch()
}
