/**
 * CSV column order for the Clinical Research Registrations (ICTRP) download
 * offered on the explore and visualise pages.
 *
 * Without this the columns follow the key order of the prepared trial records,
 * which groups them by how the data was assembled — all the plain source
 * columns first, then every checkbox-derived field — so related columns end up
 * far apart. The order below groups them by meaning instead.
 *
 * Fields present in the data but absent from this list are appended to the end
 * of the CSV rather than dropped, so a new source column still reaches the
 * download; see `prepareCsvExportFile`.
 */
export const clinicalTrialsColumnOrder: string[] = [
    // ---- Identity & registration ------------------------------------------------
    'TrialID',
    'TrialNumber',
    'SecTrialNumber',
    'Register',
    'SourceLink',
    'ResultsLink',
    'RegistrationYear',
    'EnrolmentStartYear',

    // ---- Linked / related trials ------------------------------------------------
    'RelatedTrialRecord',
    'RelatedTrialIdentifier',
    'LinkedList',
    'LinkedTrial',

    // ---- Titles -----------------------------------------------------------------
    'TrialTitle',
    'TrialTitlePublic',
    'TrialTitleScientific',

    // ---- Study design & status --------------------------------------------------
    'StudyType',
    'Phase',
    'RecruitmentStatus',
    'EthicsStatus',
    'SampleSize',

    // ---- Interventions ----------------------------------------------------------
    'InterventionNames',
    'Interventions',
    'MainIntervention',
    'SecondaryIntervention',

    // ---- Outcomes ---------------------------------------------------------------
    'Outcomes',

    // ---- Diagnostics ------------------------------------------------------------
    'DiagnosticsCategorisation',
    'DiagnosticsThemeCategory',
    'DiagnosticsD1Sub',

    // ---- Pathogens & diseases ---------------------------------------------------
    'Families',
    'Pathogens',
    'Diseases',
    'Strains',

    // ---- Study population -------------------------------------------------------
    'StudySubject',
    'AgeGroups',
    'Gender',
    'VulnerablePopulations',
    'OccupationalGroups',

    // ---- Research institution ---------------------------------------------------
    'ResearchInstitutionName',
    'ResearchInstitutionCountryName',
    'ResearchInstitutionCountry',
    'ResearchInstitutionRegion',

    // ---- Research location ------------------------------------------------------
    'ResearchLocationCountryName',
    'ResearchLocationCountry',
    'ResearchLocationRegion',
    'ResearchLocationCountryNameAll',
    'ResearchLocationRegionAll',
]

export default clinicalTrialsColumnOrder
