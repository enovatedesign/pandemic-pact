import fs from 'fs-extra'
import path from 'path'
import { info, error } from './log'
import { getBranchName } from './get-branch-name'
import { assetBaseUrl } from './s3-client'
import { DatasetConfig } from '../config/datasets'

/**
 * Downloads the cached clinical-trials static files from S3 (via the CloudFront
 * read URL) for the skip path, then re-explodes select-options.json into the
 * per-field public files the frontend fetches.
 *
 * Returns false (rather than throwing) if any file is missing, so the caller can
 * fall back to a full generation.
 */
export async function downloadTrialsStaticFiles(
    config: DatasetConfig,
): Promise<boolean> {
    const baseUrl = assetBaseUrl()

    const branchName = getBranchName()
    info(`Downloading cached clinical-trials static files from S3 for branch "${branchName}"...`)

    const prefix = `${baseUrl}/${branchName}/cache/clinical-trials`

    const filesToDownload = [
        { url: `${prefix}/select-options.json`, path: config.outputPaths.selectOptionsJson },
        { url: `${prefix}/trials.json`, path: config.outputPaths.visualisePublicJson },
        { url: `${prefix}/trials-dist.json.gz`, path: config.outputPaths.distGz },
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

    info('✓ Successfully downloaded all cached clinical-trials static files from S3')

    // Re-explode the consolidated select-options into the per-field files the
    // frontend filters fetch from /data/clinical-trials/select-options/<field>.json
    const selectOptions = fs.readJsonSync(config.outputPaths.selectOptionsJson)
    const publicDir = config.outputPaths.publicSelectOptionsDir
    fs.ensureDirSync(publicDir)

    Object.entries(selectOptions).forEach(([field, options]) => {
        fs.writeJsonSync(`${publicDir}/${field}.json`, options)
    })

    info(`✓ Extracted ${Object.keys(selectOptions).length} individual clinical-trials select-option files`)

    return true
}
