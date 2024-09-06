import fs from 'fs-extra'
import _ from 'lodash'
import { title, printWrittenFileStats } from '../helpers/log'
import {
    mpoxResearchPriorityAndSubPriorityMapping,
    convertSourceKeysToOurKeys,
} from '../helpers/key-mapping'

type Row = { [key: string]: string }

// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
    title('Generating select options')

    const dictionary: Row[] = fs.readJsonSync('./data/download/dictionary.json')

    const researchCategoryMapping: Row[] = fs.readJsonSync(
        './data/download/research-category-mapping.json'
    )

    const rawOptions = Object.fromEntries(
        parseCheckboxOptionsFromDictionary(dictionary).concat(
            parseResearchCategoriesAndSubcategories(researchCategoryMapping)
        )
    )

    const path = './data/dist'

    const optionsWithConvertedKeys = convertSourceKeysToOurKeys(
        prepareMpoxResearchPriorityAndSubPriority(rawOptions)
    )

    const selectOptions: { [key: string]: any[] } = {
        ...optionsWithConvertedKeys,
        ResearchInstitutionCountry: _.cloneDeep(
            optionsWithConvertedKeys.FunderCountry
        ),
        ResearchLocationCountry: _.cloneDeep(
            optionsWithConvertedKeys.FunderCountry
        ),
        ResearchLocationRegion: _.cloneDeep(
            optionsWithConvertedKeys.FunderRegion
        ),
        GrantStartYear: getUniqueValuesFromRawGrants('grant_start_year'),
        ResearchInstitutionName: getUniqueValuesFromRawGrants(
            'research_institition_name'
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
    const grants: any[] = fs.readJsonSync('./data/dist/grants.json')

    selectOptions.FundingOrgName = selectOptions.FundingOrgName.filter(funder =>
        grants.some(grant => grant.FundingOrgName.includes(funder.value))
    )

    const pathname = `${path}/select-options.json`

    fs.writeJsonSync(pathname, selectOptions)

    printWrittenFileStats(pathname)

    const publicPath = './public/data/select-options'

    fs.emptyDirSync(publicPath)

    Object.entries(selectOptions).forEach(([key, value]) => {
        const pathname = `${publicPath}/${key}.json`

        fs.writeJsonSync(pathname, value)

        printWrittenFileStats(pathname)
    })
}

function prepareMpoxResearchPriorityAndSubPriority(rawOptions: {
    [key: string]: any[]
}) {
    const MPOXResearchPriorityOptions =
        rawOptions.research_and_policy_roadmaps.filter(
            ({ value }) => value in mpoxResearchPriorityAndSubPriorityMapping
        )

    const MPOXResearchSubPriorityOptions = MPOXResearchPriorityOptions.flatMap(
        ({ value }) => {
            const field = mpoxResearchPriorityAndSubPriorityMapping[value]

            return rawOptions[field].map(subOption => ({
                value: value + subOption.value,
                label: subOption.label,
                parent: value,
            }))
        }
    )

    return {
        ...rawOptions,
        mpox_research_priority: MPOXResearchPriorityOptions,
        mpox_research_sub_priority: MPOXResearchSubPriorityOptions,
    }
}

function parseCheckboxOptionsFromDictionary(dictionary: Row[]) {
    const checkBoxFields = dictionary.filter(
        row => row['Field Type'] === 'checkbox'
    )

    return checkBoxFields.map(row => [
        row['Variable / Field Name'],
        parseSelectOptionsFromChoices(
            row['Choices, Calculations, OR Slider Labels']
        ),
    ])
}

function parseSelectOptionsFromChoices(choices: string) {
    return choices.split(' | ').map(choice => {
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
    researchCategoryMapping: Row[]
) {
    const researchCategoryValues = _.uniq(
        researchCategoryMapping.map(row => row['Broad categories Codes'])
    )

    const researchCategoryOptions = researchCategoryValues.map(value => {
        const row = researchCategoryMapping.find(
            row => row['Broad categories Codes'] === value
        )

        if (typeof row === 'undefined') {
            throw new Error(`Could not find row with value ${value}`)
        }

        return {
            value: value.trim(),
            label: row['Broad categories Description'].trim(),
        }
    })

    const researchSubCategoryOptions = researchCategoryMapping.map(row => {
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

function getUniqueValuesFromRawGrants(key: string) {
    const grants: Row[] = fs.readJsonSync('./data/download/grants.json')

    const values = grants.map(grant => grant[key])

    return _.uniq(values)
        .filter(value => value)
        .sort()
        .map(value => ({
            value,
            label: value,
        }))
}
