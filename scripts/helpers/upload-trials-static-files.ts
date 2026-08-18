import fs from 'fs-extra'
import { info } from './log'
import { getBranchName } from './get-branch-name'
import { s3PutObject, invalidateCloudFront } from './s3-client'
import { DatasetConfig } from '../config/datasets'

/**
 * Uploads the clinical-trials static artefacts to S3 (the build cache restored
 * on the skip path by downloadTrialsStaticFiles).
 *
 * Only the consolidated files are cached — the many per-field select-option
 * files are re-exploded from select-options.json on restore, exactly as the
 * grants cache does. The per-trial files are not cached here: they live under
 * ${branch}/clinical-trials/ and are read from S3 at runtime.
 */
export async function uploadTrialsStaticFiles(config: DatasetConfig) {
    const branchName = getBranchName()
    info(`Uploading clinical-trials static files to S3 for branch "${branchName}"...`)

    const prefix = `${branchName}/cache/clinical-trials`

    const filesToUpload = [
        { path: config.outputPaths.selectOptionsJson, key: `${prefix}/select-options.json` },
        { path: config.outputPaths.visualisePublicJson, key: `${prefix}/trials.json` },
        { path: config.outputPaths.distGz, key: `${prefix}/trials-dist.json.gz` },
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

    await invalidateCloudFront([`/${prefix}/*`])

    info('Finished uploading clinical-trials static files to S3')
}
