import fs from 'fs-extra'
import _ from 'lodash'
import {RawGrant, ProcessedGrant} from '../types/generate'
import {title, info, printWrittenFileStats} from '../helpers/log.mjs'

export default function () {
    title('Preparing grants')

    const rawGrants: RawGrant[] = fs.readJsonSync('./data/download/grants.json')

    const headings = Object.keys(rawGrants[0])

    const checkboxAndTextFields = _.partition(
        headings,
        heading => heading.includes('___')
    )

    const checkBoxFields = _.uniq(
        checkboxAndTextFields[0].map(
            field => field.split('___')[0]
        )
    )

    const [commaSeparatedFields, textFields] = _.partition(
        checkboxAndTextFields[1],
        field => [
            'research_institution_country',
            'research_institution_country_iso',
            'research_location_country',
            'research_location_country_iso',
            'main_research_priority_area_number_new',
            'main_research_sub_priority_number_new',
        ].includes(field)
    )

    const [numericFields, stringFields] = _.partition(
        textFields,
        field => field === 'award_amount_converted'
    )

    const grants = rawGrants.map((rawGrant, index, array) => {
        if (index > 0 && (index % 500 === 0 || index === array.length - 1)) {
            info(`Processed ${index} of ${array.length} grants`)
        }

        const stringFieldValues = _.pick(rawGrant, stringFields)

        const numericFieldValues = Object.fromEntries(
            Object.entries(
                _.pick(rawGrant, numericFields)
            ).map(
                ([key, value]) => [key, parseFloat(value)]
            )
        )

        const checkBoxFieldValues = Object.fromEntries(
            checkBoxFields.map(
                field => ([
                    field,
                    convertCheckBoxFieldToArray(rawGrant, field),
                ])
            )
        )

        const commaSeparatedFieldValues = Object.fromEntries(
            commaSeparatedFields.map(
                field => ([
                    field,
                    convertCommaSeparatedValueFieldToArray(rawGrant, field),
                ])
            )
        )

        return convertSourceKeysToOurKeys({
            ...stringFieldValues,
            ...numericFieldValues,
            ...checkBoxFieldValues,
            ...commaSeparatedFieldValues,
        })
    })

    const pathname = './data/dist/grants.json'

    fs.writeJsonSync(pathname, grants)

    printWrittenFileStats(pathname)
}

function convertCommaSeparatedValueFieldToArray(grant: RawGrant, field: string) {
    if (!grant[field]) {
        return []
    }

    return grant[field].split(',')
        .map(value => value.trim())
        .filter(value => value !== '')
}

function convertCheckBoxFieldToArray(grant: RawGrant, field: string) {
    return Object.entries(grant).filter(
        ([key, value]) => key.startsWith(`${field}___`) && value === '1'
    ).map(
        ([key]) => key.split('___')[1].replace(/^_/, '-')
    )
}

function convertSourceKeysToOurKeys(processedGrant: ProcessedGrant) {
    // Note that some of the columns in the source spreadsheets are not included
    // here because we don't need them.

    const keyMapping: {[key: string]: string} = {
        'pactid': 'GrantID',
        'grant_number': 'PubMedGrantId',
        'grant_title_eng': 'GrantTitleEng',
        'award_amount_converted': 'GrantAmountConverted',
        'abstract': 'Abstract',
        'grant_start_year': 'GrantStartYear',
        'study_subject': 'StudySubject',
        'ethnicity': 'Ethnicity',
        'age_groups': 'AgeGroups',
        'rurality': 'Rurality',
        'vulnerable_population': 'VulnerablePopulations',
        'occupational_groups': 'OccupationalGroups',
        'study_type': 'StudyType',
        'clinical_trial': 'ClinicalTrial',
        'pathogen': 'Pathogen',
        'disease': 'Disease',
        'funder_name': 'FundingOrgName',
        'funder_country': 'FunderCountry',
        'funder_region': 'FunderRegion',
        'research_institition_name': 'ResearchInstitutionName',
        'research_institution_region': 'ResearchInstitutionRegion',
        'research_institution_country_iso': 'ResearchInstitutionCountry',
        'research_location_region': 'ResearchLocationRegion',
        'research_location_country_iso': 'ResearchLocationCountry',
        'main_research_priority_area_number_new': 'ResearchCat',
        'main_research_sub_priority_number_new': 'ResearchSubcat',
        'tags': 'Tags',
    };

    const newGrant: ProcessedGrant = {};

    for (const [key, value] of Object.entries(processedGrant)) {
        if (keyMapping[key] === undefined) {
            continue;
        }

        newGrant[keyMapping[key]] = value;
    }

    return newGrant;
}
