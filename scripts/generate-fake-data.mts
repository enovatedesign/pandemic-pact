import fs from 'fs-extra'
import {faker} from '@faker-js/faker'
import _ from 'lodash'
import chalk from 'chalk'

// Set the seed to get consistent results each time
// https://fakerjs.dev/guide/usage.html#reproducible-results
faker.seed(37148927482342)

const lookupTables = fs.readJsonSync('./data/source/lookup-tables.json')

const funders = _.range(50).map(() => {
    return {
        "FundingOrgName": faker.company.name(),
        "FunderAcronym": faker.hacker.abbreviation(),
        "FunderCountry": faker.location.countryCode('alpha-2'),
        "FunderRegion": faker.helpers.objectValue(lookupTables.Regions),
        "FunderSubregion": faker.helpers.objectValue(lookupTables.Subregions),
    }
})

const researchInstitutions = _.range(25).map(() => {
    return {
        "ResearchInstitutionName": faker.company.name(),
        "ResearchInstitutionCountry": faker.location.countryCode('alpha-2'),
        "ResearchInstitutionRegion": faker.helpers.objectValue(lookupTables.Regions),
        "ResearchInstitutionSubregion": faker.helpers.objectValue(lookupTables.Subregions),
    }
})

const data = _.range(20000).map(grantId => {
    const funder = faker.helpers.arrayElement(funders)
    const researchInstitution = faker.helpers.arrayElement(researchInstitutions)

    return Object.assign(
        {
            "GrantID": grantId,
            "GrantTitleEng": _.startCase(faker.company.buzzPhrase()),
            "GrantRegion": faker.helpers.objectValue(lookupTables.Regions),
            "GrantCountry": faker.location.countryCode('alpha-2'),
            "GrantSubregion": faker.helpers.objectValue(lookupTables.Subregions),
            "GrantAmountConverted": faker.number.float({min: 100, max: 10000, precision: 0.2}),
            "Abstract": faker.lorem.paragraphs(3),
            "LaySummary": faker.lorem.paragraph(),
            "GrantEndYear": faker.date.future({years: 5}).getFullYear(),
            "StudySubject": faker.helpers.objectValue(lookupTables.StudySubject),
            "Ethnicity": faker.helpers.objectValue(lookupTables.Ethnicity),
            "AgeGroups": faker.helpers.objectValue(lookupTables.AgeGroups),
            "Rurality": faker.helpers.objectValue(lookupTables.Rurality),
            "VulnerablePopulations": faker.helpers.objectValue(lookupTables.VulnerablePopulations),
            "OccupationalGroups": faker.helpers.objectValue(lookupTables.OccupationalGroups),
            "StudyType": faker.helpers.objectValue(lookupTables.StudyType),
            "ClinicalTrial": faker.helpers.objectValue(lookupTables.ClinTrial),
            "ResearchCat": "", // awaiting specification
            "ResearchSubcat": "", // awaiting specification
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
        },
        funder,
        researchInstitution,
    )
})

fs.ensureDirSync('./data/dist')

fs.writeJsonSync('./data/dist/complete-dataset.json', data, {spaces: 2})

console.log(chalk.blue("Wrote 20,000 records of fake data to ./data/dist/complete-dataset.json"))

const freeTextData = data.map(
    record => _.pick(record, ['GrantID', 'GrantTitleEng', 'Abstract', 'LaySummary'])
)

fs.writeJsonSync('./data/dist/free-text-dataset.json', freeTextData, {spaces: 2})

console.log(chalk.blue("Wrote 20,000 records for free text search to ./data/dist/free-text-dataset.json"))
