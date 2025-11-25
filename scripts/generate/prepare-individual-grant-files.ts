import fs from 'fs-extra'
import _ from 'lodash'
import zlib from 'zlib'
import { ProcessedGrant, SelectOptions } from '../types/generate'
import { title, info } from '../helpers/log'

export default function prepareIndividualGrantFiles() {
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

        const pathname = `${outputPath}/${grantWithFullText['GrantID']}.json`

        fs.writeJsonSync(pathname, grantWithFullText)
    }

    // Store all the IDs in a separate file for use in generateStaticParams
    fs.writeJsonSync(
        `${outputPath}/index.json`,
        sourceGrants.map(grant => grant['GrantID']),
    )
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
