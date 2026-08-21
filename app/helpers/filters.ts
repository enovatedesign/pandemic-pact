import { createContext } from 'react'
import { every } from 'lodash'
import { FixedSelectOptions, PolicyRoadmapEntryTypeHandle } from './types'
import rrnaSelectOptions from '@/data/dist/rrna/select-options.json'

export interface Filter {
    values: string[]
    excludeGrantsWithMultipleItems: boolean
}

export interface Filters {
    [key: string]: Filter
}

export interface FilterSchema {
    label: string
    field: string
    excludeGrantsWithMultipleItems?: { label: string }
    parent?: { filter: string; value: string }
    advanced?: boolean
    loadOnClick?: boolean
    isHidden?: boolean
    // Set when the label is already plural (e.g. "Vulnerable Populations") so
    // it is displayed as-is rather than being pluralised a second time.
    isPlural?: boolean
}

// Pluralises a filter label for display in the explore/visualise UIs, e.g.
// "Register" -> "Registers", "Recruitment Status" -> "Recruitment Statuses",
// "Funder Country" -> "Funder Countries". Only handles the regular English
// cases the filter labels actually use; the schema labels themselves are left
// singular so other consumers (API payloads, column headers) are unaffected.
// Labels that are already plural (isPlural) are returned unchanged so they are
// not pluralised a second time (e.g. "Vulnerable Populations").
export function pluralizeFilterLabel(label: string, isPlural = false): string {
    if (isPlural) return label
    if (/(s|x|z|ch|sh)$/i.test(label)) return `${label}es`
    if (/[^aeiou]y$/i.test(label)) return label.replace(/y$/i, 'ies')
    return `${label}s`
}

export function availableFilters(): FilterSchema[] {
    const filters = [
        {
            label: 'Funder',
            field: 'FundingOrgName',
            excludeGrantsWithMultipleItems: { 
                label: 'Exclude Joint Funding' 
            },
        },

        {
            label: 'Family',
            field: 'Families',
            loadOnClick: false,
            isHidden: true
        },
        
        {
            label: 'Pathogen',
            field: 'Pathogens',
            excludeGrantsWithMultipleItems: { 
                label: 'Exclude Grants with Multiple Pathogens' 
            },
            isHidden: true
        },

        {
            label: 'Disease',
            field: 'Diseases',
            loadOnClick: false,
            isHidden: true
        },

        {
            label: 'Strain',
            field: 'Strains',
            loadOnClick: false,
            isHidden: true
        },

        {
            label: 'Research Category',
            field: 'ResearchCat',
        },

        {
            label: 'Funder Region',
            field: 'FunderRegion',
        },

        {
            label: 'Funder Country',
            field: 'FunderCountry',
        },

        {
            label: 'Research Institution',
            field: 'ResearchInstitutionName',
        },

        {
            label: 'Research Location Country',
            field: 'ResearchLocationCountry',
        },

        {
            label: 'Year',
            field: 'GrantStartYear',
        },

        {
            label: 'Study Subject',
            field: 'StudySubject',
            advanced: true,
        },

        {
            label: 'Study Type',
            field: 'StudyType',
            advanced: true,
        },

        {
            label: 'Age Group',
            field: 'AgeGroups',
            advanced: true,
        },

        {
            label: 'Vulnerable Populations',
            field: 'VulnerablePopulations',
            advanced: true,
            isPlural: true,
        },

        {
            label: 'Occupations of Interest',
            field: 'OccupationalGroups',
            advanced: true,
            isPlural: true,
        },
    ]

    return filters
}

export function available100DaysMissionFilters(): FilterSchema[] {
    const filters = [
        {
            label: 'Research Area',
            field: 'HundredDaysMissionResearchArea',
            loadOnClick: false
        },
        
        {
            label: 'Implementation',
            field: 'HundredDaysMissionImplementation',
            loadOnClick: false
        },
        
        {
            label: 'Clinical Trial',
            field: 'ClinicalTrial',
        },


        {
            label: 'Funder Country',
            field: 'FunderCountry',
        },
    ]

    return filters
}

export function availablePandemicIntelligenceFilters(): FilterSchema[] {
    const filters = [
        {
            label: 'Family',
            field: 'Families',
            loadOnClick: false,
            isHidden: true
        },
        {
            label: 'Pathogen',
            field: 'Pathogens',
            excludeGrantsWithMultipleItems: { 
                label: 'Exclude Grants with Multiple Pathogens' 
            },
            isHidden: true
        },
        {
            label: 'Disease',
            field: 'Diseases',
            loadOnClick: false,
            isHidden: true
        },
        {
            label: 'Funder',
            field: 'FundingOrgName',
        },
        {
            label: 'Theme',
            field: 'PandemicIntelligenceThemes',
            loadOnClick: false
        },
    ]

    return filters
}

// Clinical Research Registrations (ICTRP) filters. Field names match the CT
// select-option keys. See the Technical Specification §3 (Global Filters -
// Clinical Trials).
export function availableClinicalTrialsFilters(): FilterSchema[] {
    // Family / Pathogen / Disease / Strain are rendered by the shared cascading
    // HierarchicalFiltersBlock (driven by public/manual-hierarchy-filters.json),
    // not as flat multi-selects. Now that the CT dataset is ICTV-coded its codes
    // match the grants taxonomy, so the same component is reused on both the
    // explore and visualise pages. They are kept here (isHidden) so they are
    // included in filter state, API payloads and client-side filtering, but
    // skipped by the flat multi-select loops.
    return [
        { label: 'Family', field: 'Families', loadOnClick: false, isHidden: true },
        {
            label: 'Pathogen',
            field: 'Pathogens',
            isHidden: true,
        },
        { label: 'Disease', field: 'Diseases', loadOnClick: false, isHidden: true },
        { label: 'Strain', field: 'Strains', loadOnClick: false, isHidden: true },

        { label: 'Register', field: 'Register' },
        { label: 'Intervention', field: 'Interventions' },
        { label: 'Research Institution Location Region', field: 'ResearchInstitutionRegion' },
        { label: 'Research Institution Location Country', field: 'ResearchInstitutionCountry' },
        { label: 'Research Institution', field: 'ResearchInstitutionName' },
        { label: 'Research Location Region', field: 'ResearchLocationRegion' },
        { label: 'Research Location Country', field: 'ResearchLocationCountry' },
        { label: 'Ethics Status', field: 'EthicsStatus' },
        { label: 'Outcome', field: 'Outcomes' },
        { label: 'Recruitment Status', field: 'RecruitmentStatus' },
        { label: 'Year', field: 'RegistrationYear' },

        // Advanced (mirrors the grants advanced set)
        { label: 'Study Subject', field: 'StudySubject', advanced: true },
        { label: 'Study Type', field: 'StudyType', advanced: true },
        { label: 'Age Group', field: 'AgeGroups', advanced: true },
        { label: 'Vulnerable Populations', field: 'VulnerablePopulations', advanced: true, isPlural: true },
        { label: 'Occupations of Interest', field: 'OccupationalGroups', advanced: true, isPlural: true },
        { label: 'Gender', field: 'Gender', advanced: true },
    ]
}

// Each dataset / policy-roadmap variant supplies its own filter schema. Keeping
// these in a registry (rather than a switch) means "which filters exist" lives in
// data: adding a dataset is a new entry here, not another branch below.
const filterSchemaRegistry: Record<string, () => FilterSchema[]> = {
    grants: availableFilters,
    'clinical-trials': availableClinicalTrialsFilters,
    hundredDaysMission: available100DaysMissionFilters,
    pandemicIntelligence: availablePandemicIntelligenceFilters,
}

export const getAvailableFilters = ({
    policyRoadmapEntryType,
    dataset,
}: {
    policyRoadmapEntryType?: PolicyRoadmapEntryTypeHandle
    dataset?: 'grants' | 'clinical-trials'
}): FilterSchema[] => {
    // A policy-roadmap entry type is a grants sub-variant, so it only applies when
    // the dataset isn't clinical-trials.
    const schemaKey =
        dataset === 'clinical-trials'
            ? 'clinical-trials'
            : policyRoadmapEntryType ?? 'grants'

    return (filterSchemaRegistry[schemaKey] ?? availableFilters)()
}

export function emptyFilters(
    fixedSelectOptions?: FixedSelectOptions,
    policyRoadmapEntryType?: PolicyRoadmapEntryTypeHandle
) {
    const filters = getAvailableFilters({ policyRoadmapEntryType })
    
    const filtersObject = Object.fromEntries(filters.map(({ field }) => {
        let values: string[] = []

        if (fixedSelectOptions) {
            // Retrieve the fixed values from fixedSelectOptions
            const fixedFieldValue = fixedSelectOptions[field as keyof typeof fixedSelectOptions]?.value
            
            // Push the fixed disease into the values array, 
            // this will ensure the value is present on the first page load
            if (fixedFieldValue && fixedFieldValue !== '') {
                values.push(fixedFieldValue)
            }
        }
        
        return [
            field,
            {
                values,
                excludeGrantsWithMultipleItems: false,
            },
        ]
    }))
    
    return filtersObject
}

export function emptyClinicalTrialsFilters(): Filters {
    return Object.fromEntries(
        availableClinicalTrialsFilters().map(({ field }) => [
            field,
            { values: [], excludeGrantsWithMultipleItems: false },
        ]),
    )
}

/**
 * Filters a dataset (grants or clinical trials) against a set of selected
 * filters. Dataset-agnostic: it only reads the fields named by `filters`, so the
 * caller must pass filters whose keys exist on the records — a filter on a field
 * absent from the records excludes everything (see the `undefined` guard below).
 */
export function filterRecords(records: any, filters: any, fixedSelectOptions?: FixedSelectOptions) {
    return records.filter((record: any) =>
        every(
            filters,
            ({ values, excludeGrantsWithMultipleItems }, key) => {
                let formattedKey = key

                // If fixed select options are set, the pathogen key is defined as '{someSpecificPathogen}Pathogen'
                // This is to ensure the hierarchy will only show the relevant pathogens related to the family selected
                // To ensure excludeGrantsWithMultipleItems works as expected, we need to switch the key to 'Pathogens'
                // which is a full array of all pathogens on the grant
                if ((fixedSelectOptions && fixedSelectOptions.Families?.label) &&
                    (key === `${fixedSelectOptions.Families?.label}Pathogen`)) {
                    formattedKey = 'Pathogens'
                }

                // if the record has multiple items in the field and the switch is on, exclude it.
                // Guard the field access: a record missing this field can't have "multiple items".
                if (excludeGrantsWithMultipleItems && (record[formattedKey]?.length ?? 0) > 1) {
                    return false
                }

                // if no filter values are selected, all records match
                if (values?.length === 0) {
                    return true
                }

                if (typeof record[formattedKey] === 'undefined') {
                    return false
                }

                // if the record has a single value in the field, check if it matches any of the filter values
                if (typeof record[formattedKey] === 'string') {
                    return values.includes(record[formattedKey])
                }

                // if the record has multiple values in the field, check if any of them match any of the filter values
                return record[formattedKey].some((element: any) =>
                    values.includes(element),
                )
            },
        ),
    )
}

export function emptyRrnaFilters() {
    return Object.keys(rrnaSelectOptions).map(key => ({
        [key]: []
    })).reduce((acc, obj) => ({...acc, ...obj}), {})
}

export function filterRrnaStudies(
    studies: any[], 
    selectedFilters: Record<string, string[]>,
) {
    // Create a filter key map where the key is the label of the select options
    // and the value is the corresponding data point on the study
    const rrnaFilterKeyMap = {
        "Pathogen Family": 'Families',
        "Pathogen": 'Pathogen',
        "Disease": 'Diseases',
        "Research Domain": 'Domains',
        "Study Country": 'StudyCountry',
        "Study Type": 'StudyTypeRrna',
        "Study Design": 'StudyDesign',
        "Study Population": 'AgeGroupsRrna',
        "Strains": 'Strains',
    }
    
    return studies.filter(study =>
        every(selectedFilters, (filterValues, filterKey) => {
            // If the filter has no values selected, include the study
            if (filterValues.length === 0) {
                return true
            }

            // Map the filter key to the corresponding study key
            const studyKey = rrnaFilterKeyMap[filterKey as keyof typeof rrnaFilterKeyMap] || filterKey;

            // If the study doesn't have the mapped key and filters ARE selected, exclude it
            if (!(studyKey in study)) {
                return false
            }

            const studyValue = study[studyKey]

            // If the study value is a string, check if it matches one of the filter values
            if (typeof studyValue === 'string') {
                return filterValues.includes(studyValue)
            }

            // If the study value is an array, check if any element matches one of the filter values
            if (Array.isArray(studyValue)) {
                return studyValue.some(value => filterValues.includes(value))
            }

            // Default to false if the study value doesn't match any condition
            return false
        })
    )
}

export function countActiveFilters(filters: Filters) {
    return Object.values(filters)
        .filter(filter => filter.values.length > 0)
        .length
}

export const GlobalFilterContext = createContext<{
    filters: Filters
    grants: any[]
    completeDataset: any[]
}>({
    filters: emptyFilters(),
    grants: [],
    completeDataset: [],
})

export const RrnaFilterContext = createContext<{
    filters: Record<string, string[]>
    studies: any[]
    completeDataset: any[]
}>({
    filters: {},
    studies: [],
    completeDataset: [],
})

export const SidebarStateContext = createContext<{
    sidebarOpen: boolean
}>({
    sidebarOpen: false,
})


export const FixedSelectOptionContext = createContext<{
    outbreakSelectOptions: {
        "Families": {
            label: string
            value: string
        },
        "Pathogens": {
            label: string 
            value: string
        }
        "Diseases": {
            label: string
            value: string
        },
        "Strain"?: {
            label: string
            value: string
        },
    }
    outbreakLevel: number
}>({
    outbreakSelectOptions: {
        "Families": {
            label: '',
            value: ''
        },
        "Pathogens": {
            label: '',
            value: ''
        },
        "Diseases": {
            label: '',
            value: ''
        },
        "Strain": {
            label: '',
            value: ''
        }
    },
    outbreakLevel: 3
})