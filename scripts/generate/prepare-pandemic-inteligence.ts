import fs from 'fs-extra'
import { pick, uniq } from "lodash"

import { printWrittenFileStats, title } from "../helpers/log"
import readLargeJson from "../helpers/read-large-json"
import { RawGrant } from "../types/generate"
import { convertCheckBoxFieldToArray, convertRawGrantKeyToValuesArray, convertSourceKeysToOurKeys } from '../helpers/key-mapping'
import { resolveTrendStartYear } from '../helpers/trend-start-year'

export default async function preparePandemicIntelligence() {
    title('Preparing Pandemic Intelligence')

    const rawGrants = await readLargeJson('./data/download/grants.json') as RawGrant[]
    
    const headings: string[] = fs.readJsonSync(
        './data/download/grants-headings.json',
    )
    
    const checkBoxFields = uniq(headings
        .filter(heading => heading.includes('___'))
        .map(heading => heading.split('___')[0]),
    )

    // Filter the grants down to only those where the pandint_themes_flag variable is set to '1'
    const pandemicIntelligenceGrants = rawGrants.filter(grant => 
        parseInt(grant['pandint_themes_flag']) === 1
    ).map(grant => {
        const checkBoxFieldValues = Object.fromEntries(
            checkBoxFields.map(field => [
                field,
                convertCheckBoxFieldToArray(grant, field),
            ])
        )
        
        const Pathogens = convertRawGrantKeyToValuesArray(grant, '_pathogen__') 
        const Diseases = convertRawGrantKeyToValuesArray(grant, '_diseases__')
        
        const convertedKeysGrantData = convertSourceKeysToOurKeys({
                pactid: grant['pactid'],
                grant_title_original: grant['grant_title_original'],
                grant_title_eng: grant['grant_title_eng'],
                abstract: grant['abstract'],
                abstract_original: grant['abstract_original'],
                award_amount_converted: grant['award_amount_converted'],
                research_location_country: grant['research_location_country'],

                Pathogens: Pathogens,
                Diseases: Diseases,

                ...checkBoxFieldValues,
            },
            true
        )
        
        let customFields = {
            TrendStartYear: resolveTrendStartYear(grant),
        }

        const baseKeysToInclude = [
            // Use the converted keys from the convertSourceKeysToOurKeys function
            'GrantID',
            'GrantTitleOriginal',
            'GrantTitleEng',
            'AbstractOriginal',
            'Abstract',
            'GrantAmountConverted',
            'FundingOrgName',
            'PolicyRoadmapResearchLocationCountry',
            'FunderCountry',
            'ResearchLocationRegion',
            'TrendStartYear',
            'Families',
            'Pathogens',
            'Diseases'
        ]

        const optimisedGrant = {
            ...pick(convertedKeysGrantData, [
                ...baseKeysToInclude,
                
                'PandemicIntelligenceThemes',
            ]),
            ...customFields,
        }
        
        return optimisedGrant
    })

    const publicPath = './public/data/pandemic-intelligence'

    const distPath = './data/dist/pandemic-intelligence.json'
    
    fs.ensureDirSync(publicPath)
    
    fs.writeJsonSync(`${publicPath}/grants.json`, pandemicIntelligenceGrants)
    printWrittenFileStats(publicPath)
    
    fs.writeJsonSync(distPath, pandemicIntelligenceGrants)
}