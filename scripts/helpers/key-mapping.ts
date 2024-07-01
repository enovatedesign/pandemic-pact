// Note that some of the columns in the source spreadsheets are not included
// here because we don't need them.
export const keyMapping: { [key: string]: string } = {
    pactid: 'GrantID',
    grant_number: 'PubMedGrantId',
    grant_title_eng: 'GrantTitleEng',
    award_amount_converted: 'GrantAmountConverted',
    abstract: 'Abstract',
    grant_start_year: 'GrantStartYear',
    grant_end_year: 'GrantEndYear',
    publication_year_of_award: 'PublicationYearOfAward',
    study_subject: 'StudySubject',
    ethnicity: 'Ethnicity',
    age_groups: 'AgeGroups',
    rurality: 'Rurality',
    vulnerable_population: 'VulnerablePopulations',
    occupational_groups: 'OccupationalGroups',
    study_type_main: 'StudyType',
    clinical_trial: 'ClinicalTrial',
    pathogen: 'Pathogen',
    disease: 'Disease',
    funder_name: 'FundingOrgName',
    funder_country: 'FunderCountry',
    funder_region: 'FunderRegion',
    research_institition_name: 'ResearchInstitutionName',
    research_institution_region: 'ResearchInstitutionRegion',
    research_institution_country_iso: 'ResearchInstitutionCountry',
    research_location_region: 'ResearchLocationRegion',
    research_location_country_iso: 'ResearchLocationCountry',
    main_research_priority_area_number_new: 'ResearchCat',
    main_research_sub_priority_number_new: 'ResearchSubcat',
    mpox_research_priority: 'MPOXResearchPriority',
    mpox_research_sub_priority: 'MPOXResearchSubPriority',
    tags: 'Tags',
}

export function convertSourceKeysToOurKeys(originalObject: {
    [key: string]: any
}) {
    const convertedObject: { [key: string]: any } = {}

    for (const [key, value] of Object.entries(originalObject)) {
        if (keyMapping[key] === undefined) {
            continue
        }

        convertedObject[keyMapping[key]] = value
    }

    return convertedObject
}
