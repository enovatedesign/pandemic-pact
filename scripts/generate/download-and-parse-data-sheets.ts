import fs from 'fs-extra'
import { read, utils } from 'xlsx'
import { title, info, printWrittenFileStats } from '../helpers/log'

export default async function () {
    title('Fetching data sheets')

    fs.emptyDirSync('data/download')

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/49506642?private_link=9e712aa1f4255e37b0db',
        'dictionary',
    )

    await downloadCsvAndConvertToJson(
        'https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com/research-categories.csv',
        'research-category-mapping',
    )

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/49550799?private_link=9e712aa1f4255e37b0db',
        'grants',
        true,
    )
}

async function downloadCsvAndConvertToJson(
    url: string,
    outputFileName: string,
    dumpHeadingRow: boolean = false,
) {
    const buffer = await fetch(url).then(res => res.arrayBuffer())

    info(`Fetched file from ${url}`)

    const workbook = read(buffer, { raw: true, dense: true })

    const sheetName = workbook.SheetNames[0]

    const sheet = workbook.Sheets[sheetName]

    const outputPath = `data/download`

    if (dumpHeadingRow) {
        const rows: string[][] = utils.sheet_to_json(sheet, {
            // Load all cells as strings instead of attempting to parse numbers, dates etc.
            raw: true,
            // Load each row as a simple array of strings
            header: 1,
        })

        const outputPathname = `${outputPath}/${outputFileName}-headings.json`

        const headingRow = rows[0]

        fs.writeJsonSync(outputPathname, headingRow)

        printWrittenFileStats(outputPathname)
    }

    const data = utils.sheet_to_json(sheet)

    const outputPathname = `${outputPath}/${outputFileName}.json`

    fs.writeJsonSync(outputPathname, data)

    printWrittenFileStats(outputPathname)
}
