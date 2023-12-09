import fs from 'fs-extra'
import _ from 'lodash'
import {ProcessedGrant, SelectOptions} from '../types/generate'
import {title, info} from '../helpers/log.mjs'

export default function () {
    title('Writing full grant data to individual files')

    const selectOptions: SelectOptions = fs.readJsonSync('./data/dist/select-options.json')

    const sourceGrants: ProcessedGrant[] = fs.readJsonSync('./data/dist/grants.json')

    const path = './data/dist/grants'

    for (let i = 0; i < sourceGrants.length; i++) {
        if (i > 0 && (i % 500 === 0 || i === sourceGrants.length - 1)) {
            info(`Processed ${i} of ${sourceGrants.length} grants`)
        }

        const grantWithFullText = Object.fromEntries(
            Object.entries(sourceGrants[i]).map(
                ([key, value]) => {
                    if (selectOptions[key] === undefined) {
                        return [key, value];
                    }

                    if (Array.isArray(value)) {
                        return [key, value.map(
                            option => selectOptions[key][option]
                        )];
                    }

                    return [key, selectOptions[key][value]];
                }
            )
        )

        fs.ensureDirSync(path)

        const pathname = `${path}/${grantWithFullText['GrantID']}.json`

        fs.writeJsonSync(pathname, grantWithFullText)
    }

    fs.writeJsonSync(
        `${path}/index.json`,
        sourceGrants.map(grant => grant['GrantID']),
    )
}
