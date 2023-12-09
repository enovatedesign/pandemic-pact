import clean from './clean.mjs'
import downloadAndParseDataSheets from './download-and-parse-data-sheets.mjs'
import prepareSelectOptions from './prepare-select-options.mjs'

main()

async function main() {
    await clean()

    await downloadAndParseDataSheets()

    prepareSelectOptions()
}
