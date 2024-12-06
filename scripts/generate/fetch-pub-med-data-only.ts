import fs from 'fs-extra'
import { title } from '../helpers/log'
import downloadCsvAndConvertToJson from '../helpers/download-and-convert-to-json'
import prepareGrants from './prepare-grants'
import fetchPubMedData from './fetch-pub-med-data'

(async () => {
    title('Fetching grants CSV')

    fs.emptyDirSync('data/download')

    await downloadCsvAndConvertToJson(
        'https://figshare.com/ndownloader/files/50659272?private_link=9e712aa1f4255e37b0db',
        'grants',
        true,
    )

    await prepareGrants()

    await fetchPubMedData()
})()
