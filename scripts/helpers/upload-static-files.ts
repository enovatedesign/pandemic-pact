import fs from 'fs-extra'
import { info } from './log'
import { getBranchName } from './get-branch-name'
import { s3PutObject, invalidateCloudFront } from './s3-client'

/**
 * Uploads generated static files to S3 (the build cache restored on cached
 * builds).
 */
export async function uploadStaticFiles() {
    const branchName = getBranchName()
    info(`Uploading static files to S3 for branch "${branchName}"...`)

    const filesToUpload = [
        { path: './data/dist/select-options.json', key: `${branchName}/cache/select-options.json` },
        { path: './data/dist/homepage-totals.json', key: `${branchName}/cache/homepage-totals.json` },
        { path: './public/data/grants.json', key: `${branchName}/cache/grants.json` },
        // NB: pandemic-pact-grants.csv is intentionally NOT uploaded. CSV exports run
        // at the end of index.ts, after this upload pass, so the file never exists yet
        // here. It is regenerated from grants.json.gz on every build, so it does not
        // need caching. (Matches the download list in download-static-files-from-blob.ts.)
        { path: './public/data/grant-ids.json', key: `${branchName}/cache/grant-ids.json` },
        { path: './public/data/100-days-mission/grants.json', key: `${branchName}/cache/100-days-mission-grants.json` },
        { path: './public/data/geojson/countries.json', key: `${branchName}/cache/countries.json` },
        { path: './public/data/geojson/who-regions.json', key: `${branchName}/cache/who-regions.json` },
        { path: './data/download/dictionary.json', key: `${branchName}/cache/dictionary.json` },
        { path: './data/download/research-category-mapping.json', key: `${branchName}/cache/research-category-mapping.json` },
        { path: './data/download/rrna-data.json', key: `${branchName}/cache/rrna-data.json` },
        { path: './data/dist/rrna/select-options.json', key: `${branchName}/cache/rrna-select-options.json` },
        { path: './public/data/rrna/studies.json', key: `${branchName}/cache/rrna/studies.json` },
        { path: './public/export/rrna/pandemic-pact-rrna-studies.csv', key: `${branchName}/cache/pandemic-pact-rrna-studies.csv` },
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
