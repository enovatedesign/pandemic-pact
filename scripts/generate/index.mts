import clean from './clean.mjs'
import downloadAndParseDataSheets from './download-and-parse-data-sheets.mjs'
import prepareSelectOptions from './prepare-select-options.mjs'
import prepareGrants from './prepare-grants.mjs'
import fetchPubmedData from './fetch-pubmed-data.mjs'

main()

async function main() {
    await clean()

    await downloadAndParseDataSheets()

    prepareSelectOptions()

    prepareGrants()

    await fetchPubmedData()
}
