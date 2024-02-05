import fs from 'fs-extra'
import _ from 'lodash'
import {title, printWrittenFileStats} from '../helpers/log'
import {convertSourceKeysToOurKeys} from '../helpers/key-mapping'

type Row = {[key: string]: string}

export default function () {
    title('Generating select options')

    const dictionary: Row[] = fs.readJsonSync('./data/download/dictionary.json')

    const researchCategoryMapping: Row[] = fs.readJsonSync('./data/download/research-category-mapping.json')

    const selectOptions = Object.fromEntries(
        parseCheckboxOptionsFromDictionary(dictionary).concat(
            parseResearchCategoriesAndSubcategories(researchCategoryMapping)
        )
    )

    const path = './data/dist'

    fs.emptyDirSync(path)

    const pathname = `${path}/select-options.json`

    const optionsWithConvertedKeys = convertSourceKeysToOurKeys(selectOptions)

    fs.writeJsonSync(pathname, {
        ...optionsWithConvertedKeys,
        ResearchInstitutionCountry: _.cloneDeep(optionsWithConvertedKeys.FunderCountry),
        ResearchLocationCountry: _.cloneDeep(optionsWithConvertedKeys.FunderCountry),
        ResearchLocationRegion: _.cloneDeep(optionsWithConvertedKeys.FunderRegion),
        GrantStartYear: getUniqueValuesFromRawGrants('grant_start_year'),
        ResearchInstitutionName: getUniqueValuesFromRawGrants('research_institition_name'),
    })

    printWrittenFileStats(pathname)
}

function parseCheckboxOptionsFromDictionary(dictionary: Row[]) {
    const checkBoxFields = dictionary.filter(
        row => row['Field Type'] === 'checkbox'
    )

    return checkBoxFields.map(
        row => ([
            row['Variable / Field Name'],
            parseSelectOptionsFromChoices(row['Choices, Calculations, OR Slider Labels'])
        ])
    )
}

function parseSelectOptionsFromChoices(choices: string) {
    return choices.split(' | ').map(choice => {
        const [id, ...rest] = choice.split(',')

        return {
            value: id.trim(),
            label: rest.join(',')
                .replace(/<[^>]*>?/gm, '') // remove html tags (if any)
                .trim()
        }
    })
}

function parseResearchCategoriesAndSubcategories(researchCategoryMapping: Row[]) {
    const researchCategoryValues = _.uniq(
        researchCategoryMapping.map(row => row['Broad categories Codes'])
    )

    const researchCategoryOptions = researchCategoryValues.map(value => {
        const row = researchCategoryMapping.find(row => row['Broad categories Codes'] === value)

        if (typeof row === 'undefined') {
            throw new Error(`Could not find row with value ${value}`)
        }

        return {
            value: value.trim(),
            label: row['Broad categories Description'].trim(),
        }
    })

    const researchSubCategoryOptions = researchCategoryMapping.map(row => {
        return {
            value: row['Coded'].trim(),
            label: row[' Sub categories Description'].trim(),
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

    return _.uniq(values).filter(
        value => value
    ).sort().map(value => ({
        value,
        label: value,
    }))
}
