/*
   Canonical display orderings for the RRNA visualisations.

   These are the single source of truth for the order in which research domains,
   study designs and population groups appear across the RRNA dashboard. The
   label strings must match exactly the values produced in
   `data/dist/rrna/select-options.json` (which derive from the RRNA data
   dictionary), otherwise items will be dropped from the ordered output.

   Ordering follows the RRNA Technical Specification (V2):
   - Domains: protocol order (§4.1 / §6)
   - Study designs: highest level of evidence first (§6)
   - Population groups: §4.5 / §7
*/

// Research domains, in protocol order.
export const RRNA_DOMAIN_ORDER = [
    'Clinical characteristics, epidemiology',
    'Immune response, seroprevalence',
    'Transmission (human-to-human)',
    'Risk Factors for infection, severe disease',
    'Vaccine and therapeutic prophylaxis',
    'Diagnostic methods',
    'Therapeutics',
    'Supportive care',
    'Social and behavioural factors',
] as const

/*
   Study designs, highest level of evidence first. Labels match the REDCap
   `interventional_study_design` / `observational_study_design` choice labels.
   "Opinion pieces with primary data" currently has no studies in the dataset
   but is retained for completeness/ordering. "Other" (REDCap -88) is kept as a
   trailing bucket so stacked segments always sum to the domain total.
*/
export const RRNA_STUDY_DESIGN_ORDER = [
    'Randomized controlled trial',
    'Non-randomized interventional studies',
    'Uncontrolled interventional studies',
    'Cohort',
    'Case-control',
    'Cross-sectional',
    'Opinion pieces with primary data',
    'Case report/Case series',
    'Other',
] as const

// Population groups (age_groups_rrna display categories).
export const RRNA_POPULATION_ORDER = [
    'Children',
    'Adults',
    'Pregnant women',
    'Not reported',
] as const

/**
 * Orders a set of labels by their position in `order`. Labels present in
 * `labels` but not in `order` are appended alphabetically after the known ones,
 * so unexpected values are still shown rather than silently dropped.
 */
export const orderByReference = (labels: string[], order: readonly string[]): string[] => {
    const known = order.filter(label => labels.includes(label))
    const unknown = labels
        .filter(label => !order.includes(label as any))
        .sort((a, b) => a.localeCompare(b))

    return [...known, ...unknown]
}
