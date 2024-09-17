import fs from 'fs-extra'
import _ from 'lodash'
import { ProcessedGrant } from '../types/generate'
import { title, printWrittenFileStats } from '../helpers/log'

export default function () {
    title('Preparing optimised visualise-page grants data file')

    const sourceGrants: ProcessedGrant[] = fs.readJsonSync(
        './data/dist/grants.json',
    )

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
            'MPOXResearchPriority',
            'MPOXResearchSubPriority',
            'InfluenzaA',
            'InfluenzaH1',
            'InfluenzaH2',
            'InfluenzaH3',
            'InfluenzaH5',
            'InfluenzaH6',
            'InfluenzaH7',
            'InfluenzaH10',
            'Tags',
        ])
    })

    const pathname = './public/data/grants.json'

    fs.writeJsonSync(pathname, optimisedGrants)

    printWrittenFileStats(pathname)
}
