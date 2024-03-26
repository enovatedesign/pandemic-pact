import fs from 'fs-extra'
import _ from 'lodash'
import { RawGrant } from '../types/generate'
import { convertSourceKeysToOurKeys } from '../helpers/key-mapping'
import { title, info, printWrittenFileStats } from '../helpers/log'

type Row = { [key: string]: string }

// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
    title('Preparing grants')

    const rawGrants: RawGrant[] = fs.readJsonSync('./data/download/grants.json')

    const dictionary: Row[] = fs.readJsonSync('./data/download/dictionary.json')

    // Get the keys from the first grant in our parsed Grants JSON data
    const dataHeadings = Object.keys(rawGrants[0])
    // Also, get the keys from the dictionary
    const dictionaryHeadings = dictionary.map(
        row => row['Variable / Field Name']
    )

    // Merge them and remove duplicates
    const headings = _.uniq([...dictionaryHeadings, ...dataHeadings])

    const checkboxAndTextFields = _.partition(headings, heading =>
        heading.includes('___')
    )

    const checkBoxFields = _.uniq(
        checkboxAndTextFields[0].map(field => field.split('___')[0])
    )

    const [commaSeparatedFields, textFields] = _.partition(
        checkboxAndTextFields[1],
        field =>
            [
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
        if (index > 0 && index % 500 === 0) {
            info(`Processed ${index} of ${array.length} grants`)
        }

        const stringFieldValues = _.pick(rawGrant, stringFields)

        const numericFieldValues = Object.fromEntries(
            Object.entries(_.pick(rawGrant, numericFields)).map(
                ([key, value]) => [key, parseFloat(value)]
            )
        )

        const checkBoxFieldValues = Object.fromEntries(
            checkBoxFields.map(field => [
                field,
                convertCheckBoxFieldToArray(rawGrant, field),
            ])
        )

        const commaSeparatedFieldValues = Object.fromEntries(
            commaSeparatedFields.map(field => [
                field,
                convertCommaSeparatedValueFieldToArray(rawGrant, field),
            ])
        )

        const convertedKeysGrantData = convertSourceKeysToOurKeys({
            ...stringFieldValues,
            ...numericFieldValues,
            ...checkBoxFieldValues,
            ...commaSeparatedFieldValues,
        })

        // Add custom data fields of our own
        let customFields = {
            // Add 'TrendStartYear' default value if 'grant_start_year' is missing
            TrendStartYear: Number(
                rawGrant.grant_start_year ?? rawGrant.publication_year_of_award
            ),
        }

        // If we have a 'grant_start_year' and it's a valid year, but before 2020
        // use 'publication_year_of_award' instead. Also, if it's a NaN year
        // use 'publication_year_of_award' instead too.
        if (rawGrant?.grant_start_year) {
            const year = Number(rawGrant.grant_start_year)
            if ((!isNaN(year) && year < 2020) || isNaN(year)) {
                customFields.TrendStartYear = Number(
                    rawGrant.publication_year_of_award
                )
            }
        }

        return {
            ...convertedKeysGrantData,
            ...customFields,
        }
    })

    fs.emptyDirSync('./data/dist')

    const pathname = './data/dist/grants.json'

    fs.writeJsonSync(pathname, grants)

    printWrittenFileStats(pathname)
}

function convertCommaSeparatedValueFieldToArray(
    grant: RawGrant,
    field: string
) {
    if (!grant[field]) {
        return []
    }

    return grant[field]
        .split(',')
        .map(value => value.trim())
        .filter(value => value !== '')
}

function convertCheckBoxFieldToArray(grant: RawGrant, field: string) {
    return Object.entries(grant)
        .filter(
            ([key, value]) => key.startsWith(`${field}___`) && value === '1'
        )
        .map(([key]) => key.split('___')[1].replace(/^_/, '-'))
}
