/**
 * CSV column -> our field name mapping for the Clinical Research Registrations
 * (ICTRP) dataset.
 *
 * Sources of truth, in order of precedence:
 *   1. The actual columns in the work-in-progress CSV (./docs/Clinical Trials-…csv)
 *   2. The "Clinical Trials (ICTRP) - Technical Specification" PDF (./docs)
 *
 * Where the Technical Spec's variable names drift from the real CSV columns, the
 * CSV wins and the drift is noted inline (mainly the diagnostics fields).
 *
 * Checkbox (`field___code`) columns are detected automatically by the presence of
 * `___`; only their *base* name needs an entry here to be renamed and kept. The
 * per-family pathogen/disease/strain checkbox columns are intentionally NOT mapped
 * here — they are aggregated into Pathogens/Diseases/Strains via
 * DatasetConfig.multiValueFieldPrefixes, exactly as for grants.
 */
export const clinicalTrialsKeyMapping: { [key: string]: string } = {
    // ---- Identity & registration ------------------------------------------------
    pactid: 'TrialID',
    trial_number: 'TrialNumber',
    trial_title: 'TrialTitle',
    trial_title_public: 'TrialTitlePublic',
    trial_title_scientific: 'TrialTitleScientific',
    register: 'Register',
    registration_year: 'RegistrationYear',
    enrolment_start_year: 'EnrolmentStartYear',
    source_link: 'SourceLink',
    results_link: 'ResultsLink',
    sample_size: 'SampleSize',

    // ---- Linked / related trials (drives the "Exclude linked trials" toggle) -----
    // Spec §3.4 / §6.4: exclude records where related_trial_record = 1.
    related_trial_record: 'RelatedTrialRecord',
    related_trial_identifier: 'RelatedTrialIdentifier',
    linked_list: 'LinkedList',
    sec_trial_number: 'SecTrialNumber',

    // ---- Study design / status --------------------------------------------------
    design_type: 'StudyType',
    ethics_status: 'EthicsStatus',
    recruitment_status: 'RecruitmentStatus',

    // ---- Research location / institution ---------------------------------------
    research_institution_name: 'ResearchInstitutionName',
    research_institution_country_iso_name: 'ResearchInstitutionCountryName',
    research_location_country_iso_name: 'ResearchLocationCountryName',
    research_location_country_iso_name_all: 'ResearchLocationCountryNameAll',
    // ISO-code columns are exploded to arrays via commaSeparatedFields and reuse
    // the grants country/region select-options (Technical Spec §6.2).
    research_institution_country_iso: 'ResearchInstitutionCountry',
    research_location_country_iso: 'ResearchLocationCountry',

    // ---- Diagnostics categorisation (Viz 3) ------------------------------------
    // Spec uses diagnostic_categorisation_1a / diagnostics_main_theme_category /
    // diagnostics_d1_subcategory; the real CSV uses the names below.
    diagnostics_categorisation: 'DiagnosticsCategorisation',

    // ---- Checkbox bases to keep (renamed; values become arrays of codes) -------
    families: 'Families',
    main_intervention: 'MainIntervention',
    secondary_intervention: 'SecondaryIntervention',
    research_location_region: 'ResearchLocationRegion',
    research_location_region_all: 'ResearchLocationRegionAll',
    research_institution_region: 'ResearchInstitutionRegion',
    outcomes: 'Outcomes',
    phase: 'Phase',
    study_subject: 'StudySubject',
    age_groups: 'AgeGroups',
    vulnerable_population: 'VulnerablePopulations',
    occupational_groups: 'OccupationalGroups',
    gender: 'Gender',
    diagnostics_theme_category: 'DiagnosticsThemeCategory', // ___d1.. ___d4
    diagnostics_d1_sub: 'DiagnosticsD1Sub', // ___a .. ___g
}

export default clinicalTrialsKeyMapping
