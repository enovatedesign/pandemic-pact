import fs from 'fs-extra'
import _ from 'lodash'
import {RawGrant} from '../types/generate'
import {convertSourceKeysToOurKeys} from '../helpers/key-mapping.mjs'
import {title, info, printWrittenFileStats} from '../helpers/log.mjs'

export default function () {
    title('Preparing grants')

    const rawGrants: RawGrant[] = fs.readJsonSync('./data/download/grants.json')

    const headings = Object.keys(rawGrants[0])

    const checkboxAndTextFields = _.partition(
        headings,
        heading => heading.includes('___')
    )

    const checkBoxFields = _.uniq(
        checkboxAndTextFields[0].map(
            field => field.split('___')[0]
        )
    )

    const [commaSeparatedFields, textFields] = _.partition(
        checkboxAndTextFields[1],
        field => [
            'research_institution_country',
            'research_institution_country_iso',
            'research_location_country',
            'research_location_country_iso',
            'main_research_priority_area_number_new',
            'main_research_sub_priority_number_new',
        ].includes(field)
    )

    const [numericFields, stringFields] = _.partition(
        textFields,
        field => field === 'award_amount_converted'
    )

    const grants = rawGrants.map((rawGrant, index, array) => {
        if (index > 0 && (index % 500 === 0 || index === array.length - 1)) {
            info(`Processed ${index} of ${array.length} grants`)
        }

        const stringFieldValues = _.pick(rawGrant, stringFields)

        const numericFieldValues = Object.fromEntries(
            Object.entries(
                _.pick(rawGrant, numericFields)
            ).map(
                ([key, value]) => [key, parseFloat(value)]
            )
        )

        const checkBoxFieldValues = Object.fromEntries(
            checkBoxFields.map(
                field => ([
                    field,
                    convertCheckBoxFieldToArray(rawGrant, field),
                ])
            )
        )

        const commaSeparatedFieldValues = Object.fromEntries(
            commaSeparatedFields.map(
                field => ([
                    field,
                    convertCommaSeparatedValueFieldToArray(rawGrant, field),
                ])
            )
        )

        return convertSourceKeysToOurKeys({
            ...stringFieldValues,
            ...numericFieldValues,
            ...checkBoxFieldValues,
            ...commaSeparatedFieldValues,
        })
    })

    const pathname = './data/dist/grants.json'

    fs.writeJsonSync(pathname, grants)

    printWrittenFileStats(pathname)
}

function convertCommaSeparatedValueFieldToArray(grant: RawGrant, field: string) {
    if (!grant[field]) {
        return []
    }

    return grant[field].split(',')
        .map(value => value.trim())
        .filter(value => value !== '')
}

function convertCheckBoxFieldToArray(grant: RawGrant, field: string) {
    return Object.entries(grant).filter(
        ([key, value]) => key.startsWith(`${field}___`) && value === '1'
    ).map(
        ([key]) => key.split('___')[1].replace(/^_/, '-')
    )
}
