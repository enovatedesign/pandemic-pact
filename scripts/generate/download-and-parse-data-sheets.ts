import fs from 'fs-extra'
import { title } from '../helpers/log'
import downloadCsvAndConvertToJson from '../helpers/download-and-convert-to-json'

export default async function downloadAndParseDataSheet () {
    title('Fetching dataset and data dictionary from Figshare')

    // Pandemic PACT collection on Figshare
    // https://figshare.com/s/58527668245cb63f14f5
    // Pandemic PACT dataset and data dictionary on Figshare
    // https://figshare.com/s/58527668245cb63f14f5/articles/25370686

    fs.emptyDirSync('data/download')

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/49506642?private_link=9e712aa1f4255e37b0db',
        'dictionary',
    )

    await downloadCsvAndConvertToJson(
        'https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com/research-categories.csv',
        'research-category-mapping',
        false,
        ';'
    )

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/50659272?private_link=9e712aa1f4255e37b0db',
        'grants',
        true,
    )
}
