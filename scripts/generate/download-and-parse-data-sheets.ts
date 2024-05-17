import fs from 'fs-extra'
import { read, utils } from 'xlsx'
import { title, info, printWrittenFileStats } from '../helpers/log'

export default async function () {
    title('Fetching data sheets')

    fs.emptyDirSync('data/download')

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/44809558?private_link=9e94a0e039df18316faa',
        'dictionary.json'
    )

    await downloadCsvAndConvertToJson(
        'https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com/research-categories.csv',
        'research-category-mapping.json'
    )

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/46391479?private_link=58527668245cb63f14f5',
        'grants.json'
    )
}

async function downloadCsvAndConvertToJson(
    url: string,
    outputFileName: string
) {
    const buffer = await fetch(url).then(res => res.arrayBuffer())

    info(`Fetched file from ${url}`)

    const workbook = read(buffer, { raw: true })

    const sheetName = workbook.SheetNames[0]

    const sheet = workbook.Sheets[sheetName]

    const data = utils.sheet_to_json(sheet)

    const outputPathname = `data/download/${outputFileName}`

    fs.writeJsonSync(outputPathname, data)

    printWrittenFileStats(outputPathname)
}
