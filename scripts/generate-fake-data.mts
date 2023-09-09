import fs from 'fs-extra'
import {faker} from '@faker-js/faker'
import _ from 'lodash'
import chalk from 'chalk'
import {getHumanReadableFileSize} from './helpers/files.mjs'
import {Dictionary} from './types/dictionary'

interface Funder {
    "FundingOrgName": string
    "FunderAcronym": string
    "FunderCountry": string
    "FunderRegion": string
    "FunderSubregion": string
}

interface ResearchInstitution {
    "ResearchInstitutionName": string
    "ResearchInstitutionCountry": string
    "ResearchInstitutionRegion": string
    "ResearchInstitutionSubregion": string
}

// Set the seed to get consistent results each time
// https://fakerjs.dev/guide/usage.html#reproducible-results
faker.seed(37148927482342)

const lookupTables = fs.readJsonSync('./data/source/lookup-tables.json')

const funders: Funder[] = fs.readJsonSync('./data/source/funders.json').map((funderName: string) => {
    return {
        "FundingOrgName": funderName,
        "FunderAcronym": faker.hacker.abbreviation(),
        "FunderCountry": faker.location.countryCode('alpha-2'),
        "FunderRegion": faker.helpers.objectValue(lookupTables.Regions),
        "FunderSubregion": faker.helpers.objectValue(lookupTables.Subregions),
    }
})

const researchInstitutions: ResearchInstitution[] = _.range(200).map(() => {
    return {
        "ResearchInstitutionName": faker.company.name(),
        "ResearchInstitutionCountry": faker.location.countryCode('alpha-2'),
        "ResearchInstitutionRegion": faker.helpers.objectValue(lookupTables.Regions),
        "ResearchInstitutionSubregion": faker.helpers.objectValue(lookupTables.Subregions),
    }
})

const completeDataset = fs.readJsonSync('./data/source/fake-data-from-covid-tracker.json')
    .map((covidGrant: {name: string, abstract: string, lay_summary: string}, grantId: number) => {
        const funder = faker.helpers.arrayElement(funders)
        const researchInstitution = faker.helpers.arrayElement(researchInstitutions)

        const researchCatKey = faker.helpers.objectKey(lookupTables.ResearchCat)
        const researchCat = lookupTables.ResearchCat[researchCatKey]
        const researchSubcat = faker.helpers.objectValue(lookupTables.ResearchSubcat[researchCatKey])

        return {
            "GrantID": grantId,
            "GrantTitleEng": covidGrant.name,
            "GrantRegion": faker.helpers.objectValue(lookupTables.Regions),
            "GrantCountry": faker.location.countryCode('alpha-2'),
            "GrantSubregion": faker.helpers.objectValue(lookupTables.Subregions),
            "GrantAmountConverted": faker.number.float({min: 100, max: 10000, precision: 0.2}),
            "Abstract": covidGrant.abstract,
            "LaySummary": covidGrant.lay_summary,
            "GrantEndYear": faker.date.future({years: 5}).getFullYear(),
            "StudySubject": faker.helpers.objectValue(lookupTables.StudySubject),
            "Ethnicity": faker.helpers.objectValue(lookupTables.Ethnicity),
            "AgeGroups": faker.helpers.objectValue(lookupTables.AgeGroups),
            "Rurality": faker.helpers.objectValue(lookupTables.Rurality),
            "VulnerablePopulations": faker.helpers.objectValue(lookupTables.VulnerablePopulations),
            "OccupationalGroups": faker.helpers.objectValue(lookupTables.OccupationalGroups),
            "StudyType": faker.helpers.objectValue(lookupTables.StudyType),
            "ClinicalTrial": faker.helpers.objectValue(lookupTables.ClinTrial),
            "ResearchCat": researchCat,
            "ResearchSubcat": researchSubcat,
            "WHOGHObservatoryFramework": faker.helpers.objectValue(lookupTables.WHOGHObservatoryFramework),
            "100DaysMissionFramework": "", // awaiting specification
            "PolicyRoadmap01": "", // awaiting specification
            "PolicyRoadmap02": "", // awaiting specification
            "PolicyRoadmap03": "", // awaiting specification
            "PolicyRoadmap04": "", // awaiting specification
            "PolicyRoadmap05": "", // awaiting specification
            "PolicyRoadmap06": "", // awaiting specification
            "PolicyRoadmap07": "", // awaiting specification
            "PolicyRoadmap08": "", // awaiting specification
            "PolicyRoadmap09": "", // awaiting specification
            "PolicyRoadmap10": "", // awaiting specification
            "Pathogen": faker.helpers.objectValue(lookupTables.Pathogens),
            "Disease": faker.helpers.objectValue(lookupTables.Diseases),
            ...funder,
            ...researchInstitution,
        }
    })

const distDirectory = './data/dist'

fs.ensureDirSync(distDirectory)

writeToDistJsonFile(
    'complete-dataset.json',
    completeDataset,
)

writeToDistJsonFile(
    'grants-by-research-category-card.json',
    completeDataset.map((grant: Array<Dictionary<string | number>>) => _.pick(grant, [
        'GrantID',
        'ResearchCat',
        'GrantAmountConverted',
        'FundingOrgName',
    ])),
)

writeToDistJsonFile(
    'amount-spent-on-each-research-category-over-time-card.json',
    completeDataset.map((grant: Array<Dictionary<string | number>>) => _.pick(grant, [
        'GrantID',
        'ResearchCat',
        'GrantAmountConverted',
        'FundingOrgName',
        'GrantEndYear',
    ])),
)

writeToDistJsonFile(
    'grants-by-region-card.json',
    completeDataset.map((grant: Array<Dictionary<string | number>>) => _.pick(grant, [
        'GrantID',
        'GrantRegion',
        'FundingOrgName',
    ])),
)

writeToDistJsonFile(
    'grants-by-mesh-classification-card.json',
    completeDataset.map((grant: Array<Dictionary<string | number>>) => _.pick(grant, [
        'GrantID',
        'FundingOrgName',
        'Ethnicity',
        'AgeGroups',
        'Rurality',
    ])),
)

writeToDistJsonFile(
    'grants-by-country-of-research-card.json',
    completeDataset.map((grant: Array<Dictionary<string | number>>) => _.pick(grant, [
        'GrantID',
        'ResearchInstitutionCountry',
        'Pathogen',
        'FundingOrgName',
    ])),
)

fs.ensureDirSync(`${distDirectory}/grants`)

writeToDistJsonFile(
    'grants/index.json',
    completeDataset.map(({GrantID}: {GrantID: number}) => GrantID),
)

completeDataset.forEach((grant: {GrantID: number}) => {
    const pathname = `grants/${grant.GrantID}.json`
    writeToDistJsonFile(pathname, grant, false)
})

function writeToDistJsonFile(filename: string, data: any, log: boolean = true) {
    const pathname = `${distDirectory}/${filename}`

    fs.writeJsonSync(pathname, data, {spaces: 2})

    const fileSize = getHumanReadableFileSize(pathname)

    if (log) {
        console.log(chalk.blue(`Wrote ${fileSize} to ${pathname}`))
    }
}
