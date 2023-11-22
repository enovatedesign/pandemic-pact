import fs from 'fs-extra'
import _ from 'lodash'

type RawGrant = {[key: string]: string}

const rawGrants: RawGrant[] = fs.readJsonSync('./data.json')

const headings = Object.keys(rawGrants[0])

const fields = _.partition(
    headings,
    heading => heading.includes('___')
)

const textFields = fields[1]

const checkBoxFields = _.uniq(
    fields[0].map(
        field => field.split('___')[0]
    )
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

    return {
        ...textFieldValues,
        ...checkBoxFieldValues,
    }
})

fs.writeJsonSync('./grants.json', grants)

function convertCheckBoxFieldToArray(grant: RawGrant, field: string) {
    return Object.entries(grant).filter(
        ([key, value]) => key.startsWith(`${field}___`) && value === '1'
    ).map(
        ([key]) => key.split('___')[1].replace(/^_/, '-')
    )
}
