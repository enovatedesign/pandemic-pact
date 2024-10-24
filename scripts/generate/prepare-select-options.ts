import fs from 'fs-extra'
import _ from 'lodash'
import { title, printWrittenFileStats } from '../helpers/log'
import {
    mpoxResearchPriorityAndSubPriorityMapping,
    convertSourceKeysToOurKeys,
} from '../helpers/key-mapping'

type Row = { [key: string]: string }

// eslint-disable-next-line import/no-anonymous-default-export
export default function prepareSelectOptions() {
    title('Generating select options')

    const dictionary: Row[] = fs.readJsonSync('./data/download/dictionary.json')

    const researchCategoryMapping: Row[] = fs.readJsonSync(
        './data/download/research-category-mapping.json',
    )

    const grants: any[] = fs.readJsonSync('./data/dist/grants.json')

    // Merge options from the dictionary checkbox fields and the research category mapping
    // fields into an array of key-value pairs of the same format
    const rawOptions = Object.fromEntries(
        parseCheckboxOptionsFromDictionary(dictionary).concat(
            parseResearchCategoriesAndSubcategories(researchCategoryMapping),
        ),
    )

    const path = './data/dist'

    // Create a new object with all the select options keyed by field name,
    // including the MPOX Research Priorities and Sub-Priorities
    const optionsWithConvertedKeys = convertSourceKeysToOurKeys(
        prepareMpoxResearchPriorityAndSubPriority(rawOptions),
    )

    // Get the full list of select options by adding some additional option
    // fields that are not present in the source data dictionary.
    const selectOptions: { [key: string]: any[] } = {
        ...optionsWithConvertedKeys,
        // ResearchInstitutionCountry, ResearchLocationCountry and ResearchLocationRegion
        // don't have options in the dictionary, so we re-use the FunderCountry and
        // FunderRegion options for these fields
        ResearchInstitutionCountry: _.cloneDeep(
            optionsWithConvertedKeys.FunderCountry,
        ),
        ResearchLocationCountry: _.cloneDeep(
            optionsWithConvertedKeys.FunderCountry,
        ),
        ResearchLocationRegion: _.cloneDeep(
            optionsWithConvertedKeys.FunderRegion,
        ),
        // Since GrantStartYear and ResearchInstitutionName are text fields in the
        // source data, we need to determine all the distinct values in the grants
        // data ourself
        
        // Only show years 2020 and onwards, other years are included in the data for other purposes
        GrantStartYear: getUniqueValuesFromRawGrants(grants, 'GrantStartYear').filter(year => Number(year.value) >= 2020),
        ResearchInstitutionName: getUniqueValuesFromRawGrants(
            grants,
            'ResearchInstitutionName',
        ),
    }

    // Adjust case for Pandemic-prone influenza values to lowercase
    Object.keys(selectOptions).forEach(key => {
        if (key.startsWith('Influenza')) {
            selectOptions[key].forEach(option => {
                option.value = option.value.toLowerCase()
            })
        }
    })

    // Remove funders that don't have any grants
    selectOptions.FundingOrgName = selectOptions.FundingOrgName.filter(funder =>
        grants.some(grant => grant.FundingOrgName.includes(funder.value)),
    )

    // Write all the select options to a single file to be imported by
    // server-side components
    const pathname = `${path}/select-options.json`

    fs.writeJsonSync(pathname, selectOptions)

    printWrittenFileStats(pathname)

    const publicPath = './public/data/select-options'

    fs.emptyDirSync(publicPath)

    // Write each select option to a separate file in public so that they can
    // be fetched by the frontend
    Object.entries(selectOptions).forEach(([key, value]) => {
        const pathname = `${publicPath}/${key}.json`

        fs.writeJsonSync(pathname, value)

        printWrittenFileStats(pathname)
    })
}

function prepareMpoxResearchPriorityAndSubPriority(rawOptions: {
    [key: string]: any[]
}) {
    // For some reason the MPOX Research Priorities are stored in the
    // research_and_policy_roadmaps field in the source dataset, so we get them
    // from that field (which is a checkbox field)
    const MPOXResearchPriorityOptions =
        rawOptions.research_and_policy_roadmaps.filter(
            ({ value }) => value in mpoxResearchPriorityAndSubPriorityMapping,
        )

    // Prepare the MPOX Research Sub-Priorities options in the same format as
    // Subcategories
    const MPOXResearchSubPriorityOptions = MPOXResearchPriorityOptions.flatMap(
        ({ value }) => {
            const field = mpoxResearchPriorityAndSubPriorityMapping[value]

            return rawOptions[field].map(subOption => ({
                value: value + subOption.value,
                label: subOption.label,
                parent: value,
            }))
        },
    )

    return {
        ...rawOptions,
        mpox_research_priority: MPOXResearchPriorityOptions,
        mpox_research_sub_priority: MPOXResearchSubPriorityOptions,
    }
}

function parseCheckboxOptionsFromDictionary(dictionary: Row[]) {
    // Get dictionary rows that are checkbox fields
    const checkBoxFields = dictionary.filter(
        row => row['Field Type'] === 'checkbox',
    )

    // Return an array of objects with value and label properties
    // for each checkbox field
    return checkBoxFields.map(row => [
        row['Variable / Field Name'],
        parseSelectOptionsFromChoices(
            row['Choices, Calculations, OR Slider Labels'],
        ),
    ])
}

function parseSelectOptionsFromChoices(choices: string) {
    // Split the string by ' | ' and map each choice to an object with a value and label
    return choices.split(' | ').map(choice => {
        // Each choice is stored in the source data as CSV,
        // with two values. However, the second value, which is the label,
        // sometimes contains commas, so we need to split the choice by commas,
        // and then reconstruct the label by joining the rest of the values
        // after.
        const [id, ...rest] = choice.split(',')

        return {
            value: id.trim(),
            label: rest
                .join(',')
                .replace(/<[^>]*>?/gm, '') // remove html tags (if any)
                .trim(),
        }
    })
}

function parseResearchCategoriesAndSubcategories(
    researchCategoryMapping: Row[],
) {
    // Get all the distinct Research Category values
    const researchCategoryValues = _.uniq(
        researchCategoryMapping.map(row => row['Broad categories Codes']),
    )

    // Create an object with value and label properties for each Research Category
    // by finding the first row with the same value and using it's description.
    const researchCategoryOptions = researchCategoryValues.map(value => {
        const row = researchCategoryMapping.find(
            row => row['Broad categories Codes'] === value,
        )

        if (typeof row === 'undefined') {
            throw new Error(`Could not find row with value ${value}`)
        }

        return {
            value: value.trim(),
            label: row['Broad categories Description'].trim(),
        }
    })

    // Create an object with value, label and parent properties for each Research Subcategory
    const researchSubCategoryOptions = researchCategoryMapping.map(row => {
        // Get the numeric parent category value by finding the number at the start of
        // the alphanumeric subcategory value
        const parentCategoryValue = row['Coded'].match(/^\d+/)

        if (parentCategoryValue === null) {
            throw new Error(`Could not find parent category value for ${row}`)
        }

        const parent = parentCategoryValue[0].trim()

        return {
            value: row['Coded'].trim(),
            label: row['Sub categories Description'].trim(),
            parent,
        }
    })

    return [
        ['main_research_priority_area_number_new', researchCategoryOptions],
        ['main_research_sub_priority_number_new', researchSubCategoryOptions],
    ]
}

function getUniqueValuesFromRawGrants(grants: any[], key: string) {
    const values = grants.map(grant => grant[key])

    return _.uniq(values)
        .filter(value => value)
        .sort()
        .map(value => ({
            value,
            label: value,
        }))
}
