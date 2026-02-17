import { put } from '@vercel/blob'
import fs from 'fs-extra'
import { info } from './log'
import { getBranchName } from './get-branch-name'

/**
 * Uploads generated static files to Vercel Blob Storage for caching
 */
export async function uploadStaticFilesToBlob() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        info('BLOB_READ_WRITE_TOKEN not set, skipping static files upload')
        return
    }

    const branchName = getBranchName()
    info(`Uploading static files to Blob Storage for branch "${branchName}"...`)

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
            
            await put(file.key, content, {
                access: 'public',
                addRandomSuffix: false,
                token: process.env.BLOB_READ_WRITE_TOKEN,
            })

            info(`✓ Uploaded ${file.path} to blob storage`)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            info(`✗ Failed to upload ${file.path}: ${errorMessage}`)
        }
    }

    info('Finished uploading static files to Blob Storage')
}

/**
 * Uploads only the grants dist file (grants.json.gz) to Vercel Blob Storage.
 * Used when cached files are active but PubMed data has been refreshed,
 * so future cached builds include the updated PubMed data.
 */
export async function uploadGrantsDistToBlob() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        info('BLOB_READ_WRITE_TOKEN not set, skipping grants dist upload')
        return
    }

    const branchName = getBranchName()
    const filePath = './data/dist/grants.json.gz'
    const blobKey = `${branchName}/cache/grants-dist.json.gz`

    if (!fs.existsSync(filePath)) {
        info(`Skipping ${filePath} - file does not exist`)
        return
    }

    try {
        const content = fs.readFileSync(filePath)

        await put(blobKey, content, {
            access: 'public',
            addRandomSuffix: false,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        info(`✓ Uploaded updated ${filePath} to blob storage (PubMed refresh)`)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        info(`✗ Failed to upload ${filePath}: ${errorMessage}`)
    }
}
