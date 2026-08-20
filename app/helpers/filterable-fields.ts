// Canonical list of fields each dataset may be filtered on: the allowlist the
// search API validates against, and the field list the grants advanced search
// offers. Both sides must read the same list — prepareFilterClause drops an
// unrecognised field without erroring, so a field offered by the UI but missing
// here is a filter that silently does nothing.
//
// Deliberately free of React and of any data/dist import: the generate scripts
// compile this module (via app/api/helpers/search.ts) before data/dist exists,
// so deriving it from select-options.json would break `npm run generate` on a
// clean checkout. `npm run diagnose:search-mapping` reports drift instead.
//
// Every entry other than the id field must also be a key in the dataset's
// select-options.json — the indexers map one keyword field per key, so a field
// absent there is not indexed and would match nothing.

/** Ordered to match data/dist/select-options.json so the advanced search dropdown keeps its order. */
export const grantsFilterableFields = [
    'StudySubject',
    'Ethnicity',
    'AgeGroups',
    'Rurality',
    'VulnerablePopulations',
    'OccupationalGroups',
    'StudyType',
    'ClinicalTrial',
    'Families',
    'FundingOrgName',
    'FunderCountry',
    'FunderRegion',
    'ResearchInstitutionRegion',
    'ResearchLocationRegion',
    'Tags',
    'HundredDaysMissionCapacityStrengthening',
    'GlobalMpoxResearchSubPriorities',
    'WHOMpoxResearchSubPriorities',
    'MarburgCORCResearchSubPriorities',
    'HundredDaysMissionResearchArea',
    'HundredDaysMissionImplementation',
    'PandemicIntelligenceThemes',
    'ResearchCat',
    'ResearchSubcat',
    'GlobalMpoxResearchPriorities',
    'WHOMpoxResearchPriorities',
    'MarburgCORCResearchPriorities',
    'Pathogens',
    'Diseases',
    'Strains',
    'ResearchInstitutionCountry',
    'ResearchLocationCountry',
    'GrantStartYear',
    'ResearchInstitutionName',
    'PolicyRoadmaps',

    // Not a select option — filtered on directly when deep-linking to specific grants.
    'GrantID',
]

/**
 * Select-option keys that are deliberately not filterable, so the drift report in
 * scripts/diagnose-search-mapping.ts does not keep flagging them.
 */
export const grantsNonFilterableSelectOptions = [
    // Its option values are field names (AgeGroups, Rurality, …) driving the 100
    // Days Mission demographic picker, not codes stored on a grant. Nothing is
    // ever indexed under it, so a filter would match zero grants.
    'HundredDaysMissionStudyPopulation',
]

/** Ordered to match data/dist/clinical-trials/select-options.json. */
export const clinicalTrialsFilterableFields = [
    'Families',
    'ResearchLocationRegion',
    'ResearchLocationRegionAll',
    'StudyType',
    'Phase',
    'StudySubject',
    'AgeGroups',
    'Gender',
    'VulnerablePopulations',
    'OccupationalGroups',
    'Outcomes',
    'DiagnosticsThemeCategory',
    'DiagnosticsD1Sub',
    'MainIntervention',
    'SecondaryIntervention',
    'RecruitmentStatus',
    'ResearchInstitutionRegion',
    'EthicsStatus',
    'Pathogens',
    'Diseases',
    'Strains',
    'Interventions',
    'ResearchLocationCountry',
    'ResearchInstitutionCountry',
    'RegistrationYear',
    'Register',
    'ResearchInstitutionName',

    // Not a select option — see GrantID above.
    'TrialID',
]
