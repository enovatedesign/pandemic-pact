import fs from 'fs-extra'
import { pick, uniq } from "lodash"

import { printWrittenFileStats, title } from "../helpers/log"
import readLargeJson from "../helpers/read-large-json"
import { RawGrant } from "../types/generate"
import { convertCheckBoxFieldToArray, convertRawGrantKeyToValuesArray, convertSourceKeysToOurKeys } from '../helpers/key-mapping'

export default async function prepare100DaysMission() {
    title('Preparing 100 Days Mission data')

    const rawGrants = await readLargeJson('./data/download/grants.json') as RawGrant[]
    
    const headings: string[] = fs.readJsonSync(
        './data/download/grants-headings.json',
    )
    
    const checkBoxFields = uniq(headings
        .filter(heading => heading.includes('___'))
        .map(heading => heading.split('___')[0]),
    )
    
    // Filter the grants down to only those where the hundred_dm_flag variable is set to '1'
    const oneHundredDaysMissionGrants = rawGrants.filter(grant => 
        parseInt(grant['hundred_dm_flag']) === 1 ||
        grant['pactid'] === 'P43011' // Allow missed grant to pass through, updated data to follow
    ).map(grant => {
        const checkBoxFieldValues = Object.fromEntries(
            checkBoxFields.map(field => [
                field,
                convertCheckBoxFieldToArray(grant, field),
            ]),
        )
        
        const researchCat = grant['main_research_priority_area_number_new'].split(', ')
        const researchSubCat = grant['main_research_sub_priority_number_new'].split(', ')

        const Pathogens = convertRawGrantKeyToValuesArray(grant, '_pathogen__') 
        const Diseases = convertRawGrantKeyToValuesArray(grant, '_diseases__')
        
        const convertedKeysGrantData = convertSourceKeysToOurKeys({
                pactid: grant['pactid'],
                award_amount_converted: grant['award_amount_converted'],
                onehundreddm_research_area: grant['onehundreddm_research_area'],
                onehundreddm_implementation: grant['onehundreddm_implementation'],
                research_location_country: grant['research_location_country'],
                capacity_strengthening_list: grant['capacity_strengthening_list'],
                
                // Added for standard visualise page clinical trials visualisation
                main_research_priority_area_number_new: researchCat,
                main_research_sub_priority_number_new: researchSubCat,
                study_type_main: grant['study_type_main'],

                rurality: grant['rurality'],

                Pathogens: Pathogens,
                Diseases: Diseases,

                ...checkBoxFieldValues,
            }, 
            true
        )

        // Build the base keys to include manually, based on new variables within client-provided documentation
        const baseKeysToInclude = [
            'GrantID',
            'GrantAmountConverted',
            'StudyType',
            'HundredDaysMissionResearchArea',
            'HundredDaysMissionCapacityStrengthening',
            'HundredDaysMissionImplementation', 
            'research_location_country', 
        ]

        const optimisedGrant = pick(convertedKeysGrantData, [
            ...baseKeysToInclude,
            'Tags',
            'ClinicalTrial',
            'ResearchCat',
            'ResearchSubcat',
            'AgeGroups',
            'VulnerablePopulations',
            'Rurality', 
            'OccupationalGroups',
            'Ethnicity',
            'ResearchLocationRegion',
            'FundingOrgName',
            'FunderCountry',
            'Families',
            'Pathogens',
            'Diseases'
        ])
        
        return optimisedGrant
    })
    
    const publicPath = './public/data/100-days-mission'

    const distPath = './data/dist/100-days-mission.json'
    
    fs.ensureDirSync(publicPath)
    
    fs.writeJsonSync(`${publicPath}/grants.json`, oneHundredDaysMissionGrants)
    printWrittenFileStats(publicPath)
    
    fs.writeJsonSync(distPath, oneHundredDaysMissionGrants)
}


