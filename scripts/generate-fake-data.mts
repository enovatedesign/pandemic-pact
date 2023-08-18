import fs from 'fs-extra'
import {faker} from '@faker-js/faker'
import _ from 'lodash'
import chalk from 'chalk'
import getHumanReadableFileSize from './utils/getHumanReadableFileSize.mjs'

// Set the seed to get consistent results each time
// https://fakerjs.dev/guide/usage.html#reproducible-results
faker.seed(37148927482342)

const lookupTables = fs.readJsonSync('./data/source/lookup-tables.json')

const funders = fs.readJsonSync('./data/source/funders.json').map((funderName: string) => {
    return {
        "FundingOrgName": funderName,
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

    const researchCatKey = faker.helpers.objectKey(lookupTables.ResearchCat)
    const researchCat = lookupTables.ResearchCat[researchCatKey]
    const researchSubcat = faker.helpers.objectValue(lookupTables.ResearchSubcat[researchCatKey])

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
        },
        funder,
        researchInstitution,
    )
})

const directory = './data/dist'

const filename = 'complete-dataset.json'

const pathname = `${directory}/${filename}`

fs.ensureDirSync(directory)

fs.writeJsonSync(pathname, data, {spaces: 2})

const fileSize = getHumanReadableFileSize(pathname)

console.log(chalk.blue(`Wrote ${data.length} records of fake data to ${pathname} [${fileSize}]`))
