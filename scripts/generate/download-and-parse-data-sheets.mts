import fs from 'fs-extra'
import {read, utils} from 'xlsx'
import chalk from 'chalk'
import {getHumanReadableFileSize} from '../helpers/files.mjs'

export default async function () {
    console.log(chalk.white(`Fetching data sheets\n`))

    fs.ensureDirSync('data/download')

    await downloadCsvAndConvertToJson(
        'https://gitlab.enovate.co.uk/public-projects/pandemic-pact-sample-data/-/raw/main/dictionary.csv',
        'dictionary.json'
    )

    await downloadCsvAndConvertToJson(
        'https://gitlab.enovate.co.uk/public-projects/pandemic-pact-sample-data/-/raw/main/raw-grant-data.csv',
        'raw-grant-data.json'
    )

    console.log()
}

async function downloadCsvAndConvertToJson(url: string, outputFileName: string) {
    const buffer = await fetch(url).then(res => res.arrayBuffer())

    console.log(chalk.grey(`Fetched file from ${url}`))

    const workbook = read(buffer, {raw: true})

    const sheetName = workbook.SheetNames[0]

    const sheet = workbook.Sheets[sheetName]

    const data = utils.sheet_to_json(sheet)

    const outputPathname = `data/download/${outputFileName}`

    fs.writeJsonSync(outputPathname, data)

    console.log(chalk.grey(`Converted spreadsheet to ${outputPathname} (${getHumanReadableFileSize(outputPathname)})`))
}
