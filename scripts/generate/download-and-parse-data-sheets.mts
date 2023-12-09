import fs from 'fs-extra'
import {read, utils} from 'xlsx'
import {getHumanReadableFileSize} from '../helpers/files.mjs'
import {title, info, newline} from '../helpers/log.mjs'

export default async function () {
    title('Fetching data sheets')

    fs.ensureDirSync('data/download')

    await downloadCsvAndConvertToJson(
        'https://gitlab.enovate.co.uk/public-projects/pandemic-pact-sample-data/-/raw/main/dictionary.csv',
        'dictionary.json'
    )

    await downloadCsvAndConvertToJson(
        'https://gitlab.enovate.co.uk/public-projects/pandemic-pact-sample-data/-/raw/main/raw-grant-data.csv',
        'grants.json'
    )

    newline()
}

async function downloadCsvAndConvertToJson(url: string, outputFileName: string) {
    const buffer = await fetch(url).then(res => res.arrayBuffer())

    info(`Fetched file from ${url}`)

    const workbook = read(buffer, {raw: true})

    const sheetName = workbook.SheetNames[0]

    const sheet = workbook.Sheets[sheetName]

    const data = utils.sheet_to_json(sheet)

    const outputPathname = `data/download/${outputFileName}`

    fs.writeJsonSync(outputPathname, data)

    info(`Converted spreadsheet to ${outputPathname} (${getHumanReadableFileSize(outputPathname)})`)
}
