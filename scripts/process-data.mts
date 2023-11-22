import fs from 'fs-extra'
import _ from 'lodash'

type RawGrant = {[key: string]: string}

const grants: RawGrant[] = fs.readJsonSync('./data.json')

const grant = grants[0]

const checkBoxFields = [
    'study_subject',
    'ethnicity',
    'age_groups',
    'rurality',
    'vulnerable_population',
    'occupational_groups',
    'study_type',
    'study_type_main',
    'clinical_trial',
    'pathogen',
    'coronavirus',
    'disease',
    'funder_name',
    'funder_country',
    'funder_region',
    'research_institution_region',
    'tags',
]

checkBoxFields.forEach(field => {
    const x = convertCheckBoxFieldToArray(grant, field)
    console.log(field, x)
})

function convertCheckBoxFieldToArray(grant: RawGrant, field: string) {
    return Object.entries(grant).filter(
        ([key, value]) => key.startsWith(`${field}___`) && value === '1'
    ).map(
        ([key]) => key.split('___')[1].replace(/^_/, '-')
    )
}
