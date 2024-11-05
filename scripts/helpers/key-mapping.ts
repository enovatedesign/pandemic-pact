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
    influenza_a: 'InfluenzaA',
    influenza_h1: 'InfluenzaH1',
    influenza_h2: 'InfluenzaH2',
    influenza_h3: 'InfluenzaH3',
    influenza_h5: 'InfluenzaH5',
    influenza_h6: 'InfluenzaH6',
    influenza_h7: 'InfluenzaH7',
    influenza_h10: 'InfluenzaH10',
    tags: 'Tags',
}

export const mpoxResearchPriorityAndSubPriorityMapping: {
    [key: string]: string
} = {
    '14': 'pathogen_natural_history_transmission_and_diagnostics_list',
    '15': 'animal_and_environmental_research_and_research_on_diseases_vectors_list',
    '16': 'epidemiological_studies_list',
    '17': 'clinical_characterisation_and_management_list',
    '18': 'infection_prevention_and_control_list',
    '19': 'therapeutics_research_development_and_implementation_list',
    '20': 'vaccines_research_development_and_implementation_list',
    '21': 'policies_for_public_health_disease_control_community_resilience_list',
    '22': 'secondary_impacts_of_disease_response_control_measures_list',
    '23': 'health_systems_research_list',
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
