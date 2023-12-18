import dotenv from 'dotenv'
import clean from './clean.mjs'
import downloadAndParseDataSheets from './download-and-parse-data-sheets.mjs'
import prepareSelectOptions from './prepare-select-options.mjs'
import prepareGrants from './prepare-grants.mjs'
import fetchPubMedData from './fetch-pub-med-data.mjs'
import prepareIndividualGrantFiles from './prepare-individual-grant-files.mjs'
import prepareMeilisearch from './prepare-meilisearch.mjs'

main()

async function main() {
    dotenv.config({path: './.env.local'})

    await clean()

    await downloadAndParseDataSheets()

    prepareSelectOptions()

    prepareGrants()

    await fetchPubMedData()

    prepareIndividualGrantFiles()

    await prepareMeilisearch()
}
