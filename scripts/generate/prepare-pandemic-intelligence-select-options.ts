import fs from 'fs-extra'
import path from 'path'
import { uniq } from "lodash"

import { printWrittenFileStats, title } from "../helpers/log"
import readLargeJson from "../helpers/read-large-json"
import { SelectOption } from '../types/generate'

type FieldKey = 'PandemicIntelligenceThemes'

export default async function preparePandemicIntelligenceSelectOptions() {
    title('Preparing Pandemic Intelligence select options')

    const hundredDayMissionGrants = await readLargeJson('./data/dist/pandemic-intelligence.json') as any[]
    
    const publicPath = './public/data/select-options'
    fs.ensureDirSync(publicPath)

    const selectOptionsPath = path.resolve('./data/dist/select-options.json')
    const existingSelectOptions: Record<string, SelectOption[]> = fs.readJsonSync(selectOptionsPath)
    
    const pandemicIntelligenceThemesFieldName = 'PandemicIntelligenceThemes'
    
    const returnUniqueValuesArray = (field: string) => uniq(hundredDayMissionGrants.flatMap(grant => grant[field]))

    const fieldLabelMaps: Record<FieldKey, Record<number, string>> = {
        [pandemicIntelligenceThemesFieldName]: {
            1: 'AI and Technological Advances',
            2: 'Multisectoral Approaches',
            3: 'Community Centered Approaches',
            4: 'Quality Standards',
            5: 'Data Preparedness',
            6: 'Evidence to Policy',
            7: 'Governance',
            8: 'Analytical Frameworks',
        },
    }

    const fields: FieldKey[] = Object.keys(fieldLabelMaps) as FieldKey[]

    let pandemicIntelligenceSelectOptions = {} as Record<FieldKey, SelectOption[]>

    fields.forEach(field => {
        pandemicIntelligenceSelectOptions[field] = returnUniqueValuesArray(field).map(value => ({
            value,
            label: fieldLabelMaps[field][value]
        }))
    })
    
    Object.entries(pandemicIntelligenceSelectOptions).map(([field, options]) => {
        const pathname = `${publicPath}/${field}.json`
        
        fs.writeJsonSync(pathname, options)

        printWrittenFileStats(pathname)

        // Add the new options to the existing select options
        existingSelectOptions[field] = options
    })

    // Re write the select options file with the new additions
    fs.writeJsonSync(selectOptionsPath, existingSelectOptions, { spaces: 2 })
    printWrittenFileStats(selectOptionsPath)    
}