import fs from 'fs-extra'
import _ from 'lodash'

import { RawGrant } from '../types/generate'
import readLargeJson from '../helpers/read-large-json'
import {
    mpoxResearchPriorityAndSubPriorityMapping,
    convertSourceKeysToOurKeys,
} from '../helpers/key-mapping'
import { title, info, printWrittenFileStats } from '../helpers/log'
import { formatInvestigatorNames } from '../helpers/principle-investigators'

export default async function prepareGrants() {
    title('Preparing grants')
    
    const rawGrants = await readLargeJson('./data/download/grants.json') as RawGrant[]
    
    const headings: string[] = fs.readJsonSync(
        './data/download/grants-headings.json',
    )

    // Get an array where the first value is the checkbox headings and the
    // second value is all other headings
    const [checkboxFields, nonCheckboxFields] = _.partition(headings, heading =>
        heading.includes('___'),
    )

    // Get all the unique checkbox field names
    const checkBoxFields = _.uniq(
        checkboxFields.map(field => field.split('___')[0]),
    )

    // Get an array where the first value is is fields containing comma-separated
    // values, and the second value is text fields
    const [commaSeparatedFields, textFields] = _.partition(
        nonCheckboxFields,
        field =>
            [
                'research_institution_country',
                'research_institution_country_iso',
                'research_location_country',
                'research_location_country_iso',
                'main_research_priority_area_number_new',
                'main_research_sub_priority_number_new',
            ].includes(field),
    )

    // Get an array where the first value is numeric fields and the second value
    // is string fields - note that the only numeric field is award_amount_converted,
    // so this partition might be overkill.
    const [numericFields, stringFields] = _.partition(
        textFields,
        field => field === 'award_amount_converted',
    )

    const grants = rawGrants.map((rawGrant, index, array) => {
        if (index > 0 && index % 500 === 0) {
            info(`Processed ${index} of ${array.length} grants`)
        }

        // If the grant_title_eng field is empty or undefined, copy the grant_title_original field into it
        if (!rawGrant?.grant_title_eng && rawGrant?.grant_title_original) {
            rawGrant['grant_title_eng'] = rawGrant.grant_title_original
        }

        // Get an object containing only the string fields and values
        const stringFieldValues = _.pick(rawGrant, stringFields)

        // Get an object containing only the numeric fields and values,
        // converting the values to numbers
        const numericFieldValues = _.mapValues(
            _.pick(rawGrant, numericFields),
            parseFloat,
        )

        // Get an object containing only the checkbox fields with values as
        // arrays of the checked values
        const checkBoxFieldValues = Object.fromEntries(
            checkBoxFields.map(field => [
                field,
                convertCheckBoxFieldToArray(rawGrant, field),
            ]),
        )

        // Get an object containing only the comma-separated fields with values as
        // arrays of the values
        const commaSeparatedFieldValues = Object.fromEntries(
            commaSeparatedFields.map(field => [
                field,
                convertCommaSeparatedValueFieldToArray(rawGrant, field),
            ]),
        )

        // MPOX Research Priorities and Sub-Priorities are conceptually similar
        // to Research Categories and Subcategories, but in the source dataset
        // they are in a completely different format, so we need to transform them
        // to look like the Research Categories and Subcategories
        prepareMpoxResearchPriorityAndSubPriority(checkBoxFieldValues)

        // Create a new object with all the transformed data,
        // using our field names instead of the field names of the source data
        const convertedKeysGrantData = convertSourceKeysToOurKeys({
            ...stringFieldValues,
            ...numericFieldValues,
            ...checkBoxFieldValues,
            ...commaSeparatedFieldValues,
        })

        const investigatorNames = formatInvestigatorNames(
            rawGrant?.investigator_title,
            rawGrant?.investigator_firstname, 
            rawGrant?.investigator_lastname
        )

        // Add custom data fields of our own
        let customFields = {
            // Add 'TrendStartYear' default value if 'grant_start_year' is missing
            TrendStartYear: Number(
                rawGrant.grant_start_year ?? rawGrant.publication_year_of_award,
            ),
            
            // Add the formatted investigator names for use on the frontend
            InvestigatorNames: investigatorNames
        }

        // If we have a 'grant_start_year' and it's a valid year, but before 2020
        // use 'publication_year_of_award' instead. Also, if it's a NaN year
        // use 'publication_year_of_award' instead too.
        if (rawGrant?.grant_start_year) {
            const year = Number(rawGrant.grant_start_year)

            if ((!isNaN(year) && year < 2020) || isNaN(year)) {
                customFields.TrendStartYear = Number(
                    rawGrant.publication_year_of_award,
                )
            }
        }

        // Create the final grant object using the converted data combined with
        // the custom fields
        return {
            ...convertedKeysGrantData,
            ...customFields,
        }
    })

    fs.emptyDirSync('./data/dist')

    const pathname = './data/dist/grants.json'

    fs.writeJsonSync(pathname, grants)

    printWrittenFileStats(pathname)
    
    return Promise.resolve(grants)
}

function prepareMpoxResearchPriorityAndSubPriority(checkBoxFieldValues: {
    [key: string]: string[]
}) {
    // For some reason the MPOX Research Priorities are stored in the
    // research_and_policy_roadmaps field in the source dataset, so we get them
    // from that field (which is a checkbox field)
    const MPOXResearchPriority =
        checkBoxFieldValues.research_and_policy_roadmaps.filter(
            value => value in mpoxResearchPriorityAndSubPriorityMapping,
        )

    // Prepare the MPOX Research Sub-Priorities by combining the MPOX Research
    // Priorities number with the sub-priority letter to get an alphanumeric
    // value, like Research Categories and Subcategories
    const MPOXResearchSubPriority = MPOXResearchPriority.flatMap(priority => {
        const field = mpoxResearchPriorityAndSubPriorityMapping[priority]

        return checkBoxFieldValues[field].map(
            subPriority => priority + subPriority,
        )
    })

    checkBoxFieldValues.mpox_research_priority = MPOXResearchPriority
    checkBoxFieldValues.mpox_research_sub_priority = MPOXResearchSubPriority
}

function convertCommaSeparatedValueFieldToArray(
    grant: RawGrant,
    field: string,
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
    return (
        Object.entries(grant)
            .filter(
                ([key, value]) =>
                    key.startsWith(`${field}___`) && value === '1',
            )
            // In the source data, columns that represent checkbox values
            // have '-' replaced with '_' - for instance '-99' is replaced
            // with '_99'. Thus we have to replace '_' with '-' after
            // splitting by '___'
            .map(([key]) => key.split('___')[1].replace(/^_/, '-'))
    )
}
