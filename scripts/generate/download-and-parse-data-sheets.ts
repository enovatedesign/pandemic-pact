import fs from 'fs-extra'
import { read, utils } from 'xlsx'
import { title, info, printWrittenFileStats } from '../helpers/log'

export default async function () {
    title('Fetching data sheets')

    fs.emptyDirSync('data/download')

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/48700255?private_link=74c1a289a1a1de9d66f5',
        'dictionary.json',
    )

    await downloadCsvAndConvertToJson(
        'https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com/research-categories.csv',
        'research-category-mapping.json',
    )

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/48701236?private_link=74c1a289a1a1de9d66f5',
        'grants.json',
    )
}

async function downloadCsvAndConvertToJson(
    url: string,
    outputFileName: string,
) {
    const buffer = await fetch(url).then(res => res.arrayBuffer())

    info(`Fetched file from ${url}`)

    const workbook = read(buffer, { raw: true, dense: true })

    const sheetName = workbook.SheetNames[0]

    const sheet = workbook.Sheets[sheetName]

    const data = utils.sheet_to_json(sheet)

    const outputPathname = `data/download/${outputFileName}`

    fs.writeJsonSync(outputPathname, data)

    printWrittenFileStats(outputPathname)
}
