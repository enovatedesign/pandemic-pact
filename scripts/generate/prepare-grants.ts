import fs from 'fs-extra'
import _ from 'lodash'
import zlib from 'zlib'

import { RawGrant } from '../types/generate'
import { streamLargeJson, createJsonArrayWriteStream } from '../helpers/stream-io'
import {
    mpoxResearchPriorityAndSubPriorityMapping,
    convertSourceKeysToOurKeys,
    convertRawGrantKeyToValuesArray,
    convertCheckBoxFieldToArray,
    convertCommaSeparatedValueFieldToArray,
    grantPolicyRoadmaps,
} from '../helpers/key-mapping'
import { title, info, printWrittenFileStats } from '../helpers/log'
import { formatInvestigatorNames } from '../helpers/principle-investigators'
import { prepareEbolaCorcPriorities } from '../helpers/ebola-corc-priorities'

export default async function prepareGrants() {
    title('Preparing grants')
    
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

    fs.emptyDirSync('./data/dist')

    const pathname = './data/dist/grants.json'
    const writer = createJsonArrayWriteStream(pathname)

    let processedCount = 0

    await streamLargeJson('./data/download/grants.json', (rawGrant: RawGrant) => {
        processedCount++
        
        if (processedCount % 1000 === 0) {
            info(`Processed ${processedCount} grants`)
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
        prepareOutbreakPriorityAndSubPriority(checkBoxFieldValues)

        // Create a new object with all the transformed data,
        // using our field names instead of the field names of the source data
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
                rawGrant.grant_start_year ?? rawGrant.publication_year_of_award,
            ),
            
            Pathogens: convertRawGrantKeyToValuesArray(rawGrant, '_pathogen__') ,
            Diseases: convertRawGrantKeyToValuesArray(rawGrant, '_diseases__'),
            Strains: convertRawGrantKeyToValuesArray(rawGrant, '_diseases_strains_') , 
            
            // Add the formatted investigator names for use on the frontend
            InvestigatorNames: formatInvestigatorNames(
                rawGrant?.investigator_title,
                rawGrant?.investigator_firstname, 
                rawGrant?.investigator_lastname
            ),

            // Prepare the Corc Priorities
            CorcPriorities: prepareEbolaCorcPriorities(rawGrant),
            
            ...grantPolicyRoadmaps(rawGrant)
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
        const grant = {
            ...convertedKeysGrantData,
            ...customFields,
        }

        writer.writeItem(grant)
    })

    await writer.end()
    
    // Gzip the output file
    info('Creating gzipped version...');
    const gzippedPath = './data/dist/grants.json.gz'
    const jsonBuffer = fs.readFileSync(pathname)
    const gzipBuffer = zlib.gzipSync(jsonBuffer as any)
    fs.writeFileSync(gzippedPath, new Uint8Array(gzipBuffer))
    
    // Remove uncompressed file to save space
    fs.unlinkSync(pathname)
    
    printWrittenFileStats(gzippedPath)
    
    info(`Processed ${processedCount} grants total`)
    
    return Promise.resolve()
}

function prepareOutbreakPriorityAndSubPriority(checkBoxFieldValues: {
    [key: string]: string[]
}) {
    // '24': 'priority_statements_regional' is stored in research_and_policy_roadmaps
    // mpoxResearchPriorityAndSubPriorityMapping has been updated to include the relevant data where by the key is the value in 
    // research_and_policy_roadmaps and the value to that key is the corelating field in rawOptions eg '14': 'pathogen_natural_history_transmission_and_diagnostics_list',
    // Filter out the desired priorities using mpoxResearchPriorityAndSubPriorityMapping (eg: '24': 'priority_statements_regional')
    const filteredMpoxPriorityOptions = checkBoxFieldValues.research_and_policy_roadmaps.filter(
        (value) => value in mpoxResearchPriorityAndSubPriorityMapping,
    )
    
    // using the value from the filtered priority options (eg '24') 
    // retrieve the field required to access the sub priority options from rawOptions (eg: priority_statements_regional)
    const MPOXResearchPriorityOptions = filteredMpoxPriorityOptions.flatMap(
        (value) => {
            // Retrieve the necessary field
            const field = mpoxResearchPriorityAndSubPriorityMapping[value]
            
            // Return the values on that field
            return checkBoxFieldValues[field]
        }
    )
    
    // Map over the priority options and the checkbox fields returning the priority + subPriority
    const PriorityStatementsRegionalFields = MPOXResearchPriorityOptions.flatMap(priority => {
            const field = mpoxResearchPriorityAndSubPriorityMapping[priority]

            return checkBoxFieldValues[field].map(
                subPriority => priority + subPriority,
            )
        },
    )
    
    checkBoxFieldValues.mpox_research_priority = MPOXResearchPriorityOptions
    checkBoxFieldValues.priority_statements_regional = PriorityStatementsRegionalFields
    
    // For the GrantsByWhoMpoxRoadmap visualisation, the parent option is '25': 'priority_statements_who_immediate'
    // Filter down to the desired research_and_policy_roadmaps option
    // This MUST return an array and so filter is used, not find.
    checkBoxFieldValues.priority_statements_who_immediate_parent = checkBoxFieldValues.research_and_policy_roadmaps.filter(option => option === '25')

    checkBoxFieldValues.marburg_parent = checkBoxFieldValues.research_and_policy_roadmaps
        .filter(value => value === '26')
}