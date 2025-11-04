import fs from 'fs-extra'
import path from 'path'
import { uniq } from "lodash"

import { printWrittenFileStats, title } from "../helpers/log"
import readLargeJson from "../helpers/read-large-json"
import { SelectOption } from '../types/generate'

type FieldKey = 'HundredDaysMissionResearchArea' | 'HundredDaysMissionImplementation'

export default async function prepare100DaysMissionSelectOptions() {
    title('Preparing 100 Days Mission select options')

    const hundredDayMissionGrants = await readLargeJson('./data/dist/100-days-mission.json') as any[]
    
    const publicPath = './public/data/select-options'
    fs.ensureDirSync(publicPath)

    const selectOptionsPath = path.resolve('./data/dist/select-options.json')
    const existingSelectOptions: Record<string, SelectOption[]> = fs.readJsonSync(selectOptionsPath)
    
    const researchAreaFieldName = 'HundredDaysMissionResearchArea'
    const implementationFieldName = 'HundredDaysMissionImplementation'
    const studyPopulationFieldName = 'HundredDaysMissionStudyPopulation'
    
    const returnUniqueValuesArray = (field: string) => uniq(hundredDayMissionGrants.flatMap(grant => grant[field]))

    const fieldLabelMaps: Record<FieldKey, Record<number, string>> = {
        [researchAreaFieldName]: {
            1: 'Diagnostics',
            2: 'Clinical characterisation and management',
            3: 'Therapeutics',
            4: 'Vaccines'
        },
        [implementationFieldName]: {
            1: 'Manufacturing and logistics',
            2: 'Costs of products',
            3: 'Equitable allocation',
            4: 'Product acceptance',
            5: 'Health systems research'
        }
    }

    const fields: FieldKey[] = Object.keys(fieldLabelMaps) as FieldKey[]

    let hundredDaysMissionSelectOptions = {} as Record<FieldKey, SelectOption[]>

    fields.forEach(field => {
        hundredDaysMissionSelectOptions[field] = returnUniqueValuesArray(field).map(value => ({
            value,
            label: fieldLabelMaps[field][value]
        }))
    })
    
    Object.entries(hundredDaysMissionSelectOptions).map(([field, options]) => {
        const pathname = `${publicPath}/${field}.json`
        
        fs.writeJsonSync(pathname, options)

        printWrittenFileStats(pathname)

        // Add the new options to the existing select options
        existingSelectOptions[field] = options
    })

    
    const studyPopulationSelectOptions = [
        {
            label: "Age Groups",
            value: "AgeGroups"
        },
        {
            label: 'Vulnerable Populations',
            value: 'VulnerablePopulations',
        },
        {
            label: 'Occupations of Interest',
            value: 'OccupationalGroups',
        },
        {
            label: 'Ethnicity',
            value: 'Ethnicity'
        },
        {
            label: 'Rurality',
            value: 'Rurality'
        }
    ]

    existingSelectOptions[studyPopulationFieldName] = studyPopulationSelectOptions

    fs.writeJsonSync(`${publicPath}/${studyPopulationFieldName}.json`, studyPopulationSelectOptions)
    printWrittenFileStats(`${publicPath}/${studyPopulationFieldName}.json`)

    // Re write the select options file with the new additions
    fs.writeJsonSync(selectOptionsPath, existingSelectOptions, { spaces: 2 })
    printWrittenFileStats(selectOptionsPath)    
}