import dotenv from 'dotenv'
import fs from 'fs-extra'
import zlib from 'zlib'
import { SelectOptions } from '../types/generate'
import { title, info, error } from '../helpers/log'
import { uploadTrials } from '../helpers/upload-trials'
import datasets, { DatasetConfig } from '../config/datasets'

type ProcessedTrial = { [key: string]: string | string[] | number | boolean }

/**
 * Writes one JSON file per clinical trial to `public/clinical-trials/{TrialID}.json`
 * with all select-option codes resolved to their human-readable labels, plus an
 * `index.json` of all trial ids.
 *
 * Direct analogue of prepareIndividualGrantFiles for the grants dataset; the trial
 * detail route (`app/clinical-trials/[id]`) reads these files (locally, or from the
 * mirrored S3/CloudFront copy when USE_REMOTE_STORAGE is enabled).
 */
export default async function prepareIndividualTrialFiles(
    config: DatasetConfig,
    shouldUpload: boolean = false,
) {
    title('Writing full clinical trial data to individual files')

    const selectOptions: SelectOptions = fs.readJsonSync(
        config.outputPaths.selectOptionsJson,
    )

    const gzipBuffer = fs.readFileSync(config.outputPaths.distGz)
    const jsonBuffer = zlib.gunzipSync(gzipBuffer as any)
    const sourceTrials: ProcessedTrial[] = JSON.parse(jsonBuffer.toString())

    const idField = config.idField

    const outputPath = `./public/clinical-trials/`
    fs.emptyDirSync(outputPath)

    const trialsToUpload: Array<{ id: string; data: any }> = []

    for (let i = 0; i < sourceTrials.length; i++) {
        if (i > 0 && (i % 500 === 0 || i === sourceTrials.length - 1)) {
            info(`Processed ${i} of ${sourceTrials.length} clinical trials`)
        }

        const sourceTrial = sourceTrials[i]
        const trialId = sourceTrial[idField] as string

        // Replace all select option field values with their corresponding labels
        const trialWithFullText = Object.fromEntries(
            Object.entries(sourceTrial).map(([key, value]) => {
                // If there isn't a select option for this value, just return it
                // as is since there isn't a label
                if (selectOptions[key] === undefined) {
                    return [key, value]
                }

                // If it's an array, iterate over all the values in said array
                // and get the label for each value
                if (Array.isArray(value)) {
                    return [
                        key,
                        value.map(v =>
                            getLabelFromSelectOptionValue(selectOptions, key, v),
                        ),
                    ]
                }

                // Otherwise just get the label for the value
                return [
                    key,
                    getLabelFromSelectOptionValue(
                        selectOptions,
                        key,
                        value as string,
                    ),
                ]
            }),
        )

        const pathname = `${outputPath}/${trialId}.json`

        fs.writeJsonSync(pathname, trialWithFullText)

        // Collect trial data for S3 upload if needed
        if (shouldUpload) {
            trialsToUpload.push({
                id: trialId,
                data: trialWithFullText,
            })
        }
    }

    // Store all the IDs in a separate file (parity with the grants index.json)
    const trialIds = sourceTrials.map(trial => trial[idField])
    fs.writeJsonSync(`${outputPath}/index.json`, trialIds)

    // Upload to S3 if requested
    if (shouldUpload && trialsToUpload.length > 0) {
        await uploadTrials({ trials: trialsToUpload })
    }

    return trialIds
}

function getLabelFromSelectOptionValue(
    selectOptions: SelectOptions,
    key: string,
    value: string,
) {
    const options = selectOptions[key]

    const option = options.find(option => option.value === value)

    if (option === undefined) {
        return value
    }

    return option.label
}

// Allow running this file directly off the existing dist artefacts (no Figshare
// token required): `node ./compiled-scripts/scripts/generate/prepare-individual-trial-files.js`
if (require.main === module) {
    dotenv.config({ path: './.env.local' })

    const forceUpload = process.env.FORCE_UPLOAD === 'true'

    prepareIndividualTrialFiles(datasets.clinicalTrials, forceUpload)
        .then(ids => {
            info(`Wrote ${ids.length} individual clinical trial files`)
            process.exit(0)
        })
        .catch(err => {
            error(err?.stack || String(err))
            process.exit(1)
        })
}
