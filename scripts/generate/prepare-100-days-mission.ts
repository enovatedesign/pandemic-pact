import fs from 'fs-extra'
import { pick, uniq } from "lodash";

import { printWrittenFileStats, title } from "../helpers/log";
import readLargeJson from "../helpers/read-large-json";
import { RawGrant } from "../types/generate";
import { convertCheckBoxFieldToArray, convertRawGrantKeyToValuesArray, convertSourceKeysToOurKeys } from '../helpers/key-mapping';

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
            // Use the converted keys from the convertSourceKeysToOurKeys function
            'GrantID',
            'GrantAmountConverted',
            
            // For use in:
                // Visualisation 1: Scope of Clinical Research Grants
                // Visualisation 2: Clinical Trial Phase Breakdown by Research Area
            'StudyType', // Added for standard visualise page clinical trials visualisation
                // Visualisation 4: Geographical Distribution of Clinical Grants
                    // 100DM_research_area___1: Diagnostics ( 1a )
                    // 100DM_research_area___2: Clinical characterisation and management ( 4a–4e )
                    // 100DM_research_area___3: Therapeutics ( 6a–6k )
                    // 100DM_research_area___4: Vaccines ( 7a–7l )
            'HundredDaysMissionResearchArea',
            'HundredDaysMissionCapacityStrengthening',
                
            // For use in: 
                // Visualisation 5: Implementation & Access Category Summary
                    // 100DM_implementation___1: Manufacturing and logistics ( 7h or 6i )
                    // 100DM_implementation___2: Costs of products (( 1a , 6x , or 7x ) AND 9e )
                    // 100DM_implementation___3: Equitable allocation (( 1a , 6x , or 7x ) AND 8d )
                    // 100DM_implementation___4: Product acceptance (( 1a , 6x , or 7x ) AND 9d )
                    // 100DM_implementation___5: Health systems research (( 1a , 6x , or 7x ) AND ( 11a, 11c, 11f ) 
            'HundredDaysMissionImplementation', 
            
            // For use in:
                // Visualisation 4: Geographical Distribution of Clinical Grants
            'research_location_country', 
        ]

        const optimisedGrant = pick(convertedKeysGrantData, [
            ...baseKeysToInclude,
            // For use in: 
                // Visualisation 1
            'Tags',
            
            // For use in: 
                // Visualisation 2
            'ClinicalTrial',
            'ResearchCat',
            'ResearchSubcat',

            // For use in:
                // Visualisation 3
            'AgeGroups',
            'VulnerablePopulations',
            'Rurality', 
            'OccupationalGroups',
            'Ethnicity',

            // For use in:
                // Visualisation 4
            'ResearchLocationRegion',
                
                
            // For use in:
                // Visualisation 6
            'FundingOrgName',
            'FunderCountry',

            // For use in:
                // Visualisation 7
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


