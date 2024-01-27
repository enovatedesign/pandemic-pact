import fs from 'fs-extra'
import _ from 'lodash'
import {ProcessedGrant, SelectOptions} from '../types/generate'
import {title, info, warn} from '../helpers/log.mjs'

export default function () {
    title('Writing full grant data to individual files')

    const selectOptions: SelectOptions = fs.readJsonSync('./data/dist/select-options.json')

    const sourceGrants: ProcessedGrant[] = fs.readJsonSync('./data/dist/grants.json')

    const path = './data/dist/grants'

    fs.emptyDirSync(path)

    for (let i = 0; i < sourceGrants.length; i++) {
        if (i > 0 && (i % 500 === 0 || i === sourceGrants.length - 1)) {
            info(`Processed ${i} of ${sourceGrants.length} grants`)
        }

        const sourceGrant = sourceGrants[i]

        const grantWithFullText = Object.fromEntries(
            Object.entries(sourceGrant).map(
                ([key, value]) => {
                    if (selectOptions[key] === undefined) {
                        return [key, value]
                    }

                    if (Array.isArray(value)) {
                        return [
                            key,
                            value.map(v => getLabelFromSelectOptionValue(
                                selectOptions,
                                key,
                                v,
                                sourceGrant['GrantID'] as string
                            ))
                        ]
                    }

                    return [
                        key,
                        getLabelFromSelectOptionValue(
                            selectOptions,
                            key,
                            value as string,
                            sourceGrant['GrantID'] as string
                        )
                    ]
                }
            )
        )

        const pathname = `${path}/${grantWithFullText['GrantID']}.json`

        fs.writeJsonSync(pathname, grantWithFullText)
    }

    fs.writeJsonSync(
        `${path}/index.json`,
        sourceGrants.map(grant => grant['GrantID']),
    )
}

function getLabelFromSelectOptionValue(selectOptions: SelectOptions, key: string, value: string, grantId: string) {
    const options = selectOptions[key]

    const option = options.find(option => option.value === value)

    if (option === undefined) {
        warn(`Could not find option with value ${value} for key ${key} for grant ${grantId}`)
        return value
    }

    return option.label
}
