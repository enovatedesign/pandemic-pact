import fs from 'fs-extra'
import { title, info, error } from '../helpers/log'
import dataSources from '../config/data-sources'
import { readLastUsedFileIds, downloadStaticFiles } from '../helpers/storage'
import downloadCsvAndConvertToJson from '../helpers/download-and-convert-to-json'
import fetchFigshareFileDownloadUrl from '../helpers/fetch-figshare-file-download-url'

export default async function downloadAndParseDataSheet (grantsOnly: boolean = false) {
    if (!process.env.FIGSHARE_PA_TOKEN) {
        throw new Error('FIGSHARE_PA_TOKEN not set, cannot download data from Figshare')
    }

    title('Fetching dataset and data dictionary from Figshare')

    const {
        FIGSHARE_ARTICLE_ID: ARTICLE_ID,
        FIGSHARE_GRANTS_FILE_ID: GRANTS_FILE_ID,
        FIGSHARE_DATA_DICTIONARY_FILE_ID: DICTIONARY_FILE_ID,
        FIGSHARE_OUTBREAKS_FILE_ID: OUTBREAKS_FILE_ID,
        FIGSHARE_RRNA_ARTICLE_ID: RRNA_ARTICLE_ID,
        FIGSHARE_RRNA_FILE_ID: RRNA_FILE_ID,
        FIGSHARE_RRNA_DATA_DICTIONARY_FILE_ID: RRNA_DICTIONARY_FILE_ID,
    } = dataSources

    // FORCE_FULL_GENERATE bypasses the freshness marker and forces the full
    // generate path even when the source file IDs are unchanged. Escape hatch for
    // forcing a rebuild (e.g. after changing generate logic without bumping a
    // Figshare file ID). No CI job sets it by default.
    const forceFullGenerate = process.env.FORCE_FULL_GENERATE === 'true'

    const {
        grantsId: grantsPreviousFileId,
        rrnaId: rrnaPreviousFileId,
        dictionaryId: dictionaryPreviousFileId,
        rrnaDictionaryId: rrnaDictionaryPreviousFileId,
    } = await readLastUsedFileIds()
    const sourceFilesHaveChanged =
        forceFullGenerate ||
        GRANTS_FILE_ID !== grantsPreviousFileId ||
        RRNA_FILE_ID !== rrnaPreviousFileId ||
        DICTIONARY_FILE_ID !== dictionaryPreviousFileId ||
        RRNA_DICTIONARY_FILE_ID !== rrnaDictionaryPreviousFileId

    if (forceFullGenerate) {
        info('FORCE_FULL_GENERATE set — forcing the full generate path')
    }

    // If sources haven't changed, download cached static files from remote storage
    if (!sourceFilesHaveChanged) {
        info('Data sources have not changed since last fetch')

        // This will throw an error if download fails, stopping the build
        const downloadedSuccessfully = await downloadStaticFiles()

        if (downloadedSuccessfully) {
            info('Using cached static files from remote storage')
            return { shouldProcessGrants: false, useCachedFiles: true }
        } else {
            info('Cached static files download failed, proceeding to fetch fresh data.')
        }
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
            dataSources.RESEARCH_CATEGORIES_FILE,
            'research-category-mapping',
            false,
            ';'
        )

        await downloadCsvAndConvertToJson(dataDictionaryFile.download_url, 'dictionary')

        await downloadCsvAndConvertToJson(grantsFile.download_url, 'grants', true)

        // The RRNA dataset lives in a separate Figshare article; fetch its two
        // files (data + data dictionary) via the same authenticated account API.
        const rrnaFilesDownloadUrls = await fetchFigshareFileDownloadUrl(
            RRNA_ARTICLE_ID,
            [RRNA_FILE_ID, RRNA_DICTIONARY_FILE_ID]
        )

        await downloadCsvAndConvertToJson(rrnaFilesDownloadUrls[RRNA_FILE_ID], 'rrna-data')
        await downloadCsvAndConvertToJson(rrnaFilesDownloadUrls[RRNA_DICTIONARY_FILE_ID], 'rrna-data-dictionary')

        const outbreaksFile = figShareFiles.find((f: any) => f.id === OUTBREAKS_FILE_ID)
        if (!outbreaksFile) {
            throw new Error(`FigShare file with ID "${OUTBREAKS_FILE_ID}" not found.`)
        }

        await downloadCsvAndConvertToJson(outbreaksFile.download_url, 'outbreaks')
    } catch (err: any) {
        error(`Error: ${err.message}`)
    }

    return { useCachedFiles: false }
}
