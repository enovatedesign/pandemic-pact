import fs from 'fs-extra'
import { info } from './log'
import { getBranchName } from './get-branch-name'

/**
 * Downloads cached static files from Vercel Blob Storage
 * Throws an error if any download fails to ensure build does not proceed with incomplete cache
 */
export async function downloadStaticFilesFromBlob(): Promise<boolean> {
    const baseUrl = process.env.BLOB_BASE_URL

    if (!baseUrl) {
        throw new Error('BLOB_BASE_URL not set, cannot download cached static files')
    }

    const branchName = getBranchName()
    info(`Downloading cached static files from Blob Storage for branch "${branchName}"...`)

    const filesToDownload = [
        { url: `${baseUrl}/${branchName}/cache/select-options.json`, path: './data/dist/select-options.json' },
        { url: `${baseUrl}/${branchName}/cache/homepage-totals.json`, path: './data/dist/homepage-totals.json' },
        { url: `${baseUrl}/${branchName}/cache/grants.json`, path: './public/data/grants.json' },
        { url: `${baseUrl}/${branchName}/cache/pandemic-pact-grants.csv`, path: './public/export/pandemic-pact-grants.csv' },
        { url: `${baseUrl}/${branchName}/cache/grant-ids.json`, path: './public/data/grant-ids.json' },
        { url: `${baseUrl}/${branchName}/cache/100-days-mission-grants.json`, path: './public/data/100-days-mission/grants.json' },
        { url: `${baseUrl}/${branchName}/cache/countries.json`, path: './public/data/geojson/countries.json' },
        { url: `${baseUrl}/${branchName}/cache/who-regions.json`, path: './public/data/geojson/who-regions.json' },
        { url: `${baseUrl}/${branchName}/cache/dictionary.json`, path: './public/data/dictionary.json' },
        { url: `${baseUrl}/${branchName}/cache/research-category-mapping.json`, path: './public/data/research-category-mapping.json' },
    ]

    for (const file of filesToDownload) {
        const response = await fetch(file.url)

        if (!response.ok) {
            throw new Error(
                `Failed to download ${file.url}: ${response.status} ${response.statusText}. ` +
                `Build cannot proceed without complete cached files.`
            )
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        fs.ensureDirSync(require('path').dirname(file.path))
        fs.writeFileSync(file.path, buffer as any)

        info(`✓ Downloaded ${file.url}`)
    }

    info('✓ Successfully downloaded all cached static files from Blob Storage')
    
    // Extract individual select-option files from the consolidated JSON
    const selectOptions = fs.readJsonSync('./data/dist/select-options.json')
    const publicPath = './public/data/select-options'
    fs.ensureDirSync(publicPath)
    
    Object.entries(selectOptions).forEach(([key, value]) => {
        const pathname = `${publicPath}/${key}.json`
        fs.writeJsonSync(pathname, value)
    })
    
    info(`✓ Extracted ${Object.keys(selectOptions).length} individual select-option files`)

    return true
}
