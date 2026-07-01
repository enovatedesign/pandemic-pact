import fs from 'fs-extra'
import { info } from './log'
import { getBranchName } from './get-branch-name'
import { s3PutObject, invalidateCloudFront } from './s3-client'

/**
 * Uploads generated static files to S3 (the build cache restored on cached
 * builds). Mirrors uploadStaticFilesToBlob's file list and keys.
 */
export async function uploadStaticFilesToS3() {
    const branchName = getBranchName()
    info(`Uploading static files to S3 for branch "${branchName}"...`)

    const filesToUpload = [
        { path: './data/dist/select-options.json', key: `${branchName}/cache/select-options.json` },
        { path: './data/dist/homepage-totals.json', key: `${branchName}/cache/homepage-totals.json` },
        { path: './public/data/grants.json', key: `${branchName}/cache/grants.json` },
        { path: './public/export/grants/pandemic-pact-grants.csv', key: `${branchName}/cache/pandemic-pact-grants.csv` },
        { path: './public/data/grant-ids.json', key: `${branchName}/cache/grant-ids.json` },
        { path: './public/data/100-days-mission/grants.json', key: `${branchName}/cache/100-days-mission-grants.json` },
        { path: './public/data/geojson/countries.json', key: `${branchName}/cache/countries.json` },
        { path: './public/data/geojson/who-regions.json', key: `${branchName}/cache/who-regions.json` },
        { path: './data/download/dictionary.json', key: `${branchName}/cache/dictionary.json` },
        { path: './data/download/research-category-mapping.json', key: `${branchName}/cache/research-category-mapping.json` },
        { path: './data/dist/pandemic-intelligence.json', key: `${branchName}/cache/pandemic-intelligence.json` },
        { path: './data/dist/grants.json.gz', key: `${branchName}/cache/grants-dist.json.gz` },
    ]

    for (const file of filesToUpload) {
        if (!fs.existsSync(file.path)) {
            info(`Skipping ${file.path} - file does not exist`)
            continue
        }

        try {
            const content = fs.readFileSync(file.path)
            await s3PutObject(file.key, content)
            info(`✓ Uploaded ${file.path} to S3`)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            info(`✗ Failed to upload ${file.path}: ${message}`)
        }
    }

    await invalidateCloudFront([`/${branchName}/cache/*`])

    info('Finished uploading static files to S3')
}
