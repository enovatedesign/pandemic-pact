import fs from 'fs-extra'
import zlib from 'zlib'
import { ProcessedGrant, SelectOptions } from '../types/generate'
import { title, info } from '../helpers/log'
import { uploadGrants, uploadGrantsIncremental } from '../helpers/storage'
import {
    readManifest,
    writeManifest,
    hashGrant,
    GrantsManifest,
} from '../helpers/grants-manifest'

export interface PrepareIndividualGrantFilesResult {
    grantIds: string[]
    // Grant IDs to (re)index in OpenSearch: the changed set on an incremental
    // run, or undefined to mean "reindex everything" (full run / no upload).
    changedIds: string[] | undefined
    removedIds: string[]
}

export default async function prepareIndividualGrantFiles(
    shouldUploadToBlob: boolean = false,
): Promise<PrepareIndividualGrantFilesResult> {
    title('Writing full grant data to individual files')

    const selectOptions: SelectOptions = fs.readJsonSync(
        './data/dist/select-options.json',
    )

    const zippedGrantsPath = './data/dist/grants.json.gz'
    const gzipBuffer = fs.readFileSync(zippedGrantsPath)
    const jsonBuffer = zlib.gunzipSync(gzipBuffer as any)
    const sourceGrants: ProcessedGrant[] = JSON.parse(jsonBuffer.toString())

    const outputPath = `./public/grants/`
    fs.emptyDirSync(outputPath)

    // Only diff against the previous manifest when we're actually uploading.
    const prevManifest: GrantsManifest = shouldUploadToBlob
        ? await readManifest()
        : {}
    const hasPrevManifest = Object.keys(prevManifest).length > 0

    const newManifest: GrantsManifest = {}
    const changed: Array<{ id: string; data: any }> = []

    for (let i = 0; i < sourceGrants.length; i++) {
        if (i > 0 && (i % 500 === 0 || i === sourceGrants.length - 1)) {
            info(`Processed ${i} of ${sourceGrants.length} grants`)
        }

        const sourceGrant = sourceGrants[i]

        // Replace all select option field values with their corresponding labels
        const grantWithFullText = Object.fromEntries(
            Object.entries(sourceGrant).map(([key, value]) => {
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
                            getLabelFromSelectOptionValue(
                                selectOptions,
                                key,
                                v,
                                sourceGrant['GrantID'] as string,
                            ),
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
                        sourceGrant['GrantID'] as string,
                    ),
                ]
            }),
        )

        const id = grantWithFullText['GrantID'] as string

        // Serialize ONCE and use the exact same string for the written file, the
        // uploaded object and the manifest hash, so disk === storage === hash.
        const jsonString = JSON.stringify(grantWithFullText)

        fs.writeFileSync(`${outputPath}/${id}.json`, jsonString)

        if (shouldUploadToBlob) {
            const hash = hashGrant(jsonString)
            newManifest[id] = hash

            if (!hasPrevManifest || prevManifest[id] !== hash) {
                changed.push({ id, data: grantWithFullText })
            }
        }
    }

    // Store all the IDs in a separate file for use in generateStaticParams
    const grantIds = sourceGrants.map(grant => grant['GrantID'] as string)
    fs.writeJsonSync(`${outputPath}/index.json`, grantIds)

    if (!shouldUploadToBlob) {
        return { grantIds, changedIds: undefined, removedIds: [] }
    }

    const removedIds = hasPrevManifest
        ? Object.keys(prevManifest).filter(id => newManifest[id] === undefined)
        : []

    if (hasPrevManifest) {
        // Incremental: upload only changed, delete only removed, no orphan sweep.
        info(
            `Manifest diff: ${changed.length} changed/new, ${removedIds.length} removed (of ${grantIds.length} total)`,
        )
        if (changed.length > 0 || removedIds.length > 0) {
            await uploadGrantsIncremental({ changed, removedIds })
        } else {
            info('No grant changes to upload.')
        }
    } else {
        // First run / no manifest: full upload (its orphan sweep reconciles any
        // stale keys left in storage).
        if (changed.length > 0) {
            await uploadGrants({ grants: changed })
        }
    }

    // Write the manifest LAST, only after uploads/deletes have succeeded.
    await writeManifest(newManifest)

    // changedIds drives incremental OpenSearch indexing. Only meaningful when we
    // diffed against a previous manifest; otherwise reindex everything.
    const changedIds = hasPrevManifest ? changed.map(g => g.id) : undefined

    return { grantIds, changedIds, removedIds }
}

function getLabelFromSelectOptionValue(
    selectOptions: SelectOptions,
    key: string,
    value: string,
    grantId: string,
) {
    const options = selectOptions[key]

    const option = options.find(option => option.value === value)

    if (option === undefined) {
        return value
    }

    return option.label
}
