import fs from 'fs-extra'
import {faker} from '@faker-js/faker'
import _ from 'lodash'
import chalk from 'chalk'
import {getHumanReadableFileSize} from './helpers/files.mjs'
import {Dictionary} from './types/dictionary'

interface Funder {
    "FundingOrgName": string[]
    "FunderAcronym": string[]
    "FunderCountry": string
    "FunderRegion": string
    "FunderSubregion": string
}

interface ResearchInstitution {
    "ResearchInstitutionName": string[]
    "ResearchInstitutionCountry": string
    "ResearchInstitutionRegion": string
    "ResearchInstitutionSubregion": string
}

interface Grant {
    "GrantTitleEng": string
    "Abstract": string
    "LaySummary": string
    [key: string]: any
}

// Set the seed to get consistent results each time
// https://fakerjs.dev/guide/usage.html#reproducible-results
faker.seed(37148927482342)

const lookupTables = fs.readJsonSync('./data/source/lookup-tables.json')

const funders: Funder[] = fs.readJsonSync('./data/source/funders.json').map((funderName: string) => {
    return {
        "FundingOrgName": [funderName],
        "FunderAcronym": [faker.hacker.abbreviation()],
        "FunderCountry": faker.location.countryCode('alpha-2'),
        "FunderRegion": faker.helpers.objectValue(lookupTables.Regions),
        "FunderSubregion": faker.helpers.objectValue(lookupTables.Subregions),
    }
})

const researchInstitutions: ResearchInstitution[] = _.range(200).map(() => {
    return {
        "ResearchInstitutionName": [faker.company.name()],
        "ResearchInstitutionCountry": faker.location.countryCode('alpha-2'),
        "ResearchInstitutionRegion": faker.helpers.objectValue(lookupTables.Regions),
        "ResearchInstitutionSubregion": faker.helpers.objectValue(lookupTables.Subregions),
    }
})

const sourceDatasetFilename = process.env.GENERATE_REAL_DATA ?
    './data/source/sample-real-data.json' :
    './data/source/fake-data-from-covid-tracker.json'

console.log(chalk.blue(`Generating ${process.env.GENERATE_REAL_DATA ? 'real' : 'fake'} data`))

const realDataCountryMapping = {
    'Australia': 'AU',
    'Brazil': 'BR',
    'Canada': 'CA',
    'Germany': 'DE',
    'Mali': 'ML',
    'Netherlands': 'NL',
    'Uganda': 'UG',
    'United Kingdom': 'GB',
    'United States': 'US',
}

const distDirectory = './data/dist'

main()

async function main() {
    const sourceDataset = fs.readJsonSync(sourceDatasetFilename)

    const completeDataset = await Promise.all(
        sourceDataset.map(async (sourceGrant: Grant, grantId: number) => {
            const funder = faker.helpers.arrayElement(funders)
            const researchInstitution = faker.helpers.arrayElement(researchInstitutions)

            const researchCat = faker.helpers.objectKey(lookupTables.ResearchCat)
            const researchSubcat = faker.helpers.objectKey(lookupTables.ResearchSubcat[researchCat])

            let distGrant: Grant = {
                "GrantID": grantId,
                "GrantTitleEng": sourceGrant.GrantTitleEng,
                "GrantRegion": faker.helpers.objectValue(lookupTables.Regions),
                "GrantCountry": faker.location.countryCode('alpha-2'),
                "GrantSubregion": faker.helpers.objectValue(lookupTables.Subregions),
                "GrantAmountConverted": faker.number.float({min: 100, max: 10000, precision: 0.2}),
                "Abstract": sourceGrant.Abstract,
                "LaySummary": sourceGrant.LaySummary,
                "GrantStartYear": sourceGrant.GrantStartYear ?? `${faker.date.past({years: 5}).getFullYear()}`,
                "GrantEndYear": sourceGrant.GrantEndYear ?? `${faker.date.future({years: 5}).getFullYear()}`,
                "StudySubject": [faker.helpers.objectValue(lookupTables.StudySubject)],
                "Ethnicity": faker.helpers.objectValue(lookupTables.Ethnicity),
                "AgeGroups": sourceGrant.AgeGroups ?? faker.helpers.objectValue(lookupTables.AgeGroups),
                "Rurality": faker.helpers.objectValue(lookupTables.Rurality),
                "VulnerablePopulations": faker.helpers.objectValue(lookupTables.VulnerablePopulations),
                "OccupationalGroups": [faker.helpers.objectValue(lookupTables.OccupationalGroups)],
                "StudyType": [faker.helpers.objectValue(lookupTables.StudyType)],
                "ClinicalTrial": [faker.helpers.objectValue(lookupTables.ClinTrial)],
                "ResearchCat": [researchCat],
                "ResearchSubcat": [researchSubcat],
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
                "Pathogen": [faker.helpers.objectValue(lookupTables.Pathogens)],
                "Disease": [faker.helpers.objectValue(lookupTables.Diseases)],
                ...funder,
                ...researchInstitution,
            }

            if (process.env.GENERATE_REAL_DATA) {
                distGrant['Disease'] = convertMultiColumnFieldToArray(sourceGrant, 'DiseaseName')
                distGrant['StudySubject'] = convertMultiColumnFieldToArray(sourceGrant, 'StudySubject')
                distGrant['OccupationalGroups'] = convertMultiColumnFieldToArray(sourceGrant, 'OccupationalGroups')
                distGrant['StudyType'] = convertMultiColumnFieldToArray(sourceGrant, 'StudyType')
                distGrant['ClinicalTrial'] = convertMultiColumnFieldToArray(sourceGrant, 'ClinicalTrialPhase')
                distGrant['FundingOrgName'] = convertMultiColumnFieldToArray(sourceGrant, 'FunderName')
                distGrant['FunderAcronym'] = convertMultiColumnFieldToArray(sourceGrant, 'FunderAcronym')
                distGrant['ResearchInstitutionName'] = convertMultiColumnFieldToArray(sourceGrant, 'ResearchInstititionName')
                distGrant['ResearchCat'] = convertMultiColumnFieldToArray(sourceGrant, 'ResearchCat')
                distGrant['ResearchSubcat'] = convertMultiColumnFieldToArray(sourceGrant, 'ResearchSubcat')

                distGrant['FunderCountry'] = realDataCountryMapping[sourceGrant.FunderCountry as keyof typeof realDataCountryMapping]
                distGrant['ResearchInstitutionCountry'] = realDataCountryMapping[sourceGrant.ResearchInstitutionCountry as keyof typeof realDataCountryMapping]

                distGrant['FunderRegion'] = sourceGrant.FunderRegion
                distGrant['ResearchInstitutionRegion'] = sourceGrant.ResearchInstitutionRegion

            }

            const pubMedGrantId = sourceGrant.PubMedGrantId?.trim()

            if (!pubMedGrantId) {
                return Promise.resolve(distGrant)
            }

            return getPubMedLinks(pubMedGrantId).then((pubMedLinks) => {
                distGrant['PubMedLinks'] = pubMedLinks
                return distGrant
            })
        })
    )

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

    fs.ensureDirSync(`${distDirectory}/select-options`)

    _.forEach(lookupTables, (lookupTable: Dictionary<string>, lookupTableName: string) => {
        let options: Array<{label: string, value: string, parent?: string}> = []

        if (lookupTableName === 'ResearchSubcat') {
            options = _.map(
                lookupTable,
                (subLookupTable, parent) => _.map(
                    subLookupTable,
                    (label, value) => ({label, value: String(value), parent}),
                ),
            ).flat()
        } else {
            options = _.map(lookupTable, (label: string, value: string) => ({label, value}))
        }

        const pathname = `select-options/${lookupTableName}.json`

        writeToDistJsonFile(pathname, options)
    })

    writeToDistJsonFile(
        'select-options/Funders.json',
        _.uniq(
            completeDataset.map(({FundingOrgName}: {FundingOrgName: string[]}) => FundingOrgName).flat(),
        ).map(
            (FundingOrgName: any, index: number) => ({label: FundingOrgName, value: `${index + 1}`})
        )
    )

}

async function getPubMedLinks(pubMedGrantId: string) {
    const query = encodeURIComponent(`GRANT_ID:"${pubMedGrantId}"`)

    const data = await fetch(
        `https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=1000&query=${query}`
    ).then(response => response.json())

    return data.resultList.result.map(
        (result: any) => _.pick(result, ['title', 'pmid'])
    )
}

function convertMultiColumnFieldToArray(grant: Grant, fieldPrefix: string): string[] {
    const result = _.filter(
        grant,
        (value, field) => !!(`${field}`.match(new RegExp(`^${fieldPrefix}_?\\d+$`)) && value.trim() && value !== "Not Selected")
    ).map(value => value.trim())

    return result
}

function writeToDistJsonFile(filename: string, data: any, log: boolean = true) {
    const pathname = `${distDirectory}/${filename}`

    fs.writeJsonSync(pathname, data, {spaces: 2})

    const fileSize = getHumanReadableFileSize(pathname)

    if (log) {
        console.log(chalk.blue(`Wrote ${fileSize} to ${pathname}`))
    }
}
