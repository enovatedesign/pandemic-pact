import fs from 'fs-extra'
import {read, utils} from 'xlsx'
import chalk from 'chalk'
import {getHumanReadableFileSize} from './helpers/files.mjs'

main()

async function main() {
    fs.ensureDirSync('data/download')

    downloadCsvAndConvertToJson(
        'https://gitlab.enovate.co.uk/public-projects/pandemic-pact-sample-data/-/raw/main/dictionary.csv',
        'dictionary.json'
    )

    downloadCsvAndConvertToJson(
        'https://gitlab.enovate.co.uk/public-projects/pandemic-pact-sample-data/-/raw/main/raw-grant-data.csv',
        'raw-grant-data.json'
    )
}

async function downloadCsvAndConvertToJson(url: string, outputFileName: string) {
    const buffer = await fetch(url).then(res => res.arrayBuffer())

    console.log(chalk.blue(`Fetched file from ${url}`));

    const workbook = read(buffer, {raw: true})

    const sheetName = workbook.SheetNames[0]

    const sheet = workbook.Sheets[sheetName]

    const data = utils.sheet_to_json(sheet)

    const outputFilePath = `data/download/${outputFileName}`

    fs.writeJsonSync(outputFilePath, data)

    console.log(chalk.blue(`Converted spreadsheet to ${outputFilePath} (${getHumanReadableFileSize(outputFilePath)})`));
}
