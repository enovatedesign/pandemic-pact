import fs from 'fs-extra'
import _ from 'lodash'

type RawGrant = {[key: string]: string}

const rawGrants: RawGrant[] = fs.readJsonSync('./data.json')

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

const grants = rawGrants.map(rawGrant => {
    const textFieldValues = _.pick(rawGrant, textFields)

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

    return {
        ...textFieldValues,
        ...checkBoxFieldValues,
        ...commaSeparatedFieldValues,
    }
})

fs.writeJsonSync('./grants.json', grants)

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
