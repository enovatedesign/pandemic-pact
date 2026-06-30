import fs from 'fs-extra'
import path from 'path'
import { info, error } from './log'
import { getBranchName } from './get-branch-name'
import { assetBaseUrl } from './s3-client'

/**
 * Downloads cached static files from S3 (via the CloudFront read URL) for the
 * cached build path. Mirrors downloadStaticFilesFromBlob, including the
 * re-explode of select-options.json into per-key files.
 * Returns false (rather than throwing) if any file is missing, so the caller
 * can fall back to a fresh fetch.
 */
export async function downloadStaticFilesFromS3(): Promise<boolean> {
    const baseUrl = assetBaseUrl()

    const branchName = getBranchName()
    info(`Downloading cached static files from S3 for branch "${branchName}"...`)

    const filesToDownload = [
        { url: `${baseUrl}/${branchName}/cache/select-options.json`, path: './data/dist/select-options.json' },
        { url: `${baseUrl}/${branchName}/cache/homepage-totals.json`, path: './data/dist/homepage-totals.json' },
        { url: `${baseUrl}/${branchName}/cache/grants.json`, path: './public/data/grants.json' },
        { url: `${baseUrl}/${branchName}/cache/pandemic-pact-grants.csv`, path: './public/export/grants/pandemic-pact-grants.csv' },
        { url: `${baseUrl}/${branchName}/cache/grant-ids.json`, path: './public/data/grant-ids.json' },
        { url: `${baseUrl}/${branchName}/cache/100-days-mission-grants.json`, path: './public/data/100-days-mission/grants.json' },
        { url: `${baseUrl}/${branchName}/cache/countries.json`, path: './public/data/geojson/countries.json' },
        { url: `${baseUrl}/${branchName}/cache/who-regions.json`, path: './public/data/geojson/who-regions.json' },
        { url: `${baseUrl}/${branchName}/cache/dictionary.json`, path: './public/data/dictionary.json' },
        { url: `${baseUrl}/${branchName}/cache/research-category-mapping.json`, path: './public/data/research-category-mapping.json' },
        { url: `${baseUrl}/${branchName}/cache/pandemic-intelligence.json`, path: './public/data/pandemic-intelligence/grants.json' },
        { url: `${baseUrl}/${branchName}/cache/grants-dist.json.gz`, path: './data/dist/grants.json.gz' },
    ]

    for (const file of filesToDownload) {
        const response = await fetch(file.url)

        if (!response.ok) {
            error(`Failed to download ${file.url}: ${response.status} ${response.statusText}.`)
            return false
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        fs.ensureDirSync(path.dirname(file.path))
        fs.writeFileSync(file.path, buffer as any)

        info(`✓ Downloaded ${file.url}`)
    }

    info('✓ Successfully downloaded all cached static files from S3')

    // Extract individual select-option files from the consolidated JSON
    const selectOptions = fs.readJsonSync('./data/dist/select-options.json')
    const publicPath = './public/data/select-options'
    fs.ensureDirSync(publicPath)

    Object.entries(selectOptions).forEach(([key, value]) => {
        fs.writeJsonSync(`${publicPath}/${key}.json`, value)
    })

    info(`✓ Extracted ${Object.keys(selectOptions).length} individual select-option files`)

    return true
}
