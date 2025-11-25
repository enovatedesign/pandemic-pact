import fs from 'fs-extra'
import _ from 'lodash'
import zlib from 'zlib'
import { ProcessedGrant } from '../types/generate'
import { title, printWrittenFileStats } from '../helpers/log'

// Filtering and visualisation of grants data for the visualise page
// doesn't require all the fields in the grants data file, such as
// the grant title, abstract, etc, and they take up lots of space in
// the JSON file. This script removes those unneeded fields.

export default function prepareVisualisePageGrantsFile() {
    title('Preparing optimised visualise-page grants data file')


    const zippedGrantsPath = './data/dist/grants.json.gz'
    const gzipBuffer = fs.readFileSync(zippedGrantsPath)
    const jsonBuffer = zlib.gunzipSync(gzipBuffer as any)
    const sourceGrants: ProcessedGrant[] = JSON.parse(jsonBuffer.toString())
    
    const optimisedGrants: ProcessedGrant[] = sourceGrants.map(grant => {
        return _.pick(grant, [
            'GrantID',
            'GrantAmountConverted',
            'GrantStartYear',
            'GrantEndYear',
            'PublicationYearOfAward',
            'TrendStartYear',
            'StudySubject',
            'Ethnicity',
            'AgeGroups',
            'Rurality',
            'VulnerablePopulations',
            'OccupationalGroups',
            'StudyType',
            'ClinicalTrial',
            'Families',
            'Pathogen',
            'Disease',
            'FundingOrgName',
            'FunderCountry',
            'FunderRegion',
            'ResearchInstitutionName',
            'ResearchInstitutionRegion',
            'ResearchInstitutionCountry',
            'ResearchLocationRegion',
            'ResearchLocationCountry',
            'ResearchCat',
            'ResearchSubcat',
            'GlobalMpoxResearchPriorities',
            'GlobalMpoxResearchSubPriorities',
            'WHOMpoxResearchPriorities',
            'WHOMpoxResearchSubPriorities',
            'MarburgCORCResearchPriorities',
            'MarburgCORCResearchSubPriorities',
            'InfluenzaA',
            'InfluenzaH1',
            'InfluenzaH2',
            'InfluenzaH3',
            'InfluenzaH5',
            'InfluenzaH6',
            'InfluenzaH7',
            'InfluenzaH10',
            'Tags',
            'Pathogens',
            'Strains',
            'Diseases',
            'EbolaCorcPriorityGrant',
            'CorcPriorities'
        ])
    })

    const pathname = './public/data/grants.json'

    fs.writeJsonSync(pathname, optimisedGrants)

    printWrittenFileStats(pathname)
}
