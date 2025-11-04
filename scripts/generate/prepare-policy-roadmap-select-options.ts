import fs from 'fs-extra'
import path from 'path'

import { printWrittenFileStats, title } from "../helpers/log"
import { SelectOption } from '../types/generate'

export default async function preparePolicyRoadmapSelectOptions() {
    title('Preparing Policy Roadmap select options')

    const publicPath = './public/data/select-options'
    fs.ensureDirSync(publicPath)

    const selectOptionsPath = path.resolve('./data/dist/select-options.json')
    const existingSelectOptions: Record<string, SelectOption[]> = fs.readJsonSync(selectOptionsPath)

    const policyRoadmapPath = 'PolicyRoadmaps'

    const policyRoadmapSelectOptions = [
        {
            label: '100 Days Mission',
            value: 'HundredDaysMissionFlag'
        }
    ]

    existingSelectOptions[policyRoadmapPath] = policyRoadmapSelectOptions

    fs.writeJsonSync(`${publicPath}/${policyRoadmapPath}.json`, policyRoadmapSelectOptions)
    printWrittenFileStats(`${publicPath}/${policyRoadmapPath}.json`)

    // Re write the select options file with the new additions
    fs.writeJsonSync(selectOptionsPath, existingSelectOptions, { spaces: 2 })
    printWrittenFileStats(selectOptionsPath)    
}