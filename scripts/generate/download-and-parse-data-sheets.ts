import fs from 'fs-extra'
import path from 'path'
import { title, info, error } from '../helpers/log'
import dataSources from '../config/data-sources'
import { id as grantsPreviousFileId } from '../config/grants-last-used-file-id.json'
import downloadCsvAndConvertToJson from '../helpers/download-and-convert-to-json'
import { downloadStaticFilesFromBlob } from '../helpers/download-static-files-from-blob'

export default async function downloadAndParseDataSheet (grantsOnly: boolean = false) {
    if (!process.env.FIGSHARE_PA_TOKEN) {
        throw new Error('FIGSHARE_PA_TOKEN not set, cannot download data from Figshare')
    }

    title('Fetching dataset and data dictionary from Figshare')

    const {
        FIGSHARE_ARTICLE_ID: ARTICLE_ID,
        FIGSHARE_GRANTS_FILE_ID: GRANTS_FILE_ID,
        FIGSHARE_DATA_DICTIONARY_FILE_ID: DICTIONARY_FILE_ID
    } = dataSources

    const grantsFileIdHasChanged = GRANTS_FILE_ID !== grantsPreviousFileId
    
    // If source hasn't changed, download cached static files from blob
    if (!grantsFileIdHasChanged) {
        info('Grants data source has not changed since last fetch')
        
        // This will throw an error if download fails, stopping the build
        const downloadedSuccessfully = await downloadStaticFilesFromBlob()
        
        info('Using cached static files from Blob Storage')
        return { shouldProcessGrants: false, useCachedFiles: true }
    }

    fs.emptyDirSync('data/download')

    const headers = { 'Authorization': `token ${process.env.FIGSHARE_PA_TOKEN}` }
    const url = `https://api.figshare.com/v2/account/articles/${ARTICLE_ID}/files?page_size=100`

    try {
        info("Fetching latest file list from FigShare")
        const listFilesResponse = await fetch(url, { headers })
        const figShareFiles = await listFilesResponse.json()

        const dataDictionaryFile = figShareFiles.find((f: any) => f.id === DICTIONARY_FILE_ID)
        if (!dataDictionaryFile) {
            throw new Error(`FigShare file with ID "${DICTIONARY_FILE_ID}" not found.`)
        }

        const grantsFile = figShareFiles.find((f: any) => f.id === GRANTS_FILE_ID)
        if (!grantsFile) {
            throw new Error(`FigShare file with ID "${GRANTS_FILE_ID}" not found.`)
        }

        await downloadCsvAndConvertToJson(
            dataSources.RESEARCH_CATEGORIES_URL,
            'research-category-mapping',
            false,
            ';'
        )

        await downloadCsvAndConvertToJson(dataDictionaryFile.download_url, 'dictionary')

        await downloadCsvAndConvertToJson(grantsFile.download_url, 'grants', true)
    } catch (err: any) {
        error(`Error: ${err.message}`)
    }

    // Store the URL for future comparison
    const configPath = path.join(__dirname, '../../../scripts/config/grants-last-used-file-id.json')
    fs.writeJsonSync(configPath, { id: dataSources.FIGSHARE_GRANTS_FILE_ID })
    
    return { useCachedFiles: false }
}