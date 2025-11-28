import fs from 'fs-extra'
import { title } from '../helpers/log'
import downloadCsvAndConvertToJson from '../helpers/download-and-convert-to-json'

export default async function downloadAndParseDataSheet (grantsOnly: boolean = false) {
    title('Fetching dataset and data dictionary from Figshare')

    // Pandemic PACT collection on Figshare
    // https://figshare.com/s/9e712aa1f4255e37b0db

    fs.emptyDirSync('data/download')

    if (!grantsOnly) {
        await downloadCsvAndConvertToJson(
            'https://figshare.com/ndownloader/files/53222348?private_link=9e712aa1f4255e37b0db',
            'dictionary',
        )

        await downloadCsvAndConvertToJson(
            'https://b8xcmr4pduujyuoo.public.blob.vercel-storage.com/research-categories.csv',
            'research-category-mapping',
            false,
            ';'
        )
    }

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/59953199?private_link=9e712aa1f4255e37b0db',
        'grants',
        true,
    )
}