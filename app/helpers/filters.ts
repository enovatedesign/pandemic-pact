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
        },

        {
            label: 'Occupations of Interest',
            field: 'OccupationalGroups',
            advanced: true,
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

export const getAvailableFilters = ({ 
    policyRoadmapEntryType 
}: {
    policyRoadmapEntryType?: PolicyRoadmapEntryTypeHandle
}) => {
    let filters = availableFilters()

    if (policyRoadmapEntryType) {
        switch (policyRoadmapEntryType) {
            case 'hundredDaysMission':
                filters = available100DaysMissionFilters()
                break;
            
            case 'pandemicIntelligence':
                filters = availablePandemicIntelligenceFilters()
                break;

            default:
                filters = availableFilters()
                break;
        }
    }

    return filters
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

export function filterGrants(grants: any, filters: any, fixedSelectOptions?: FixedSelectOptions) {
    return grants.filter((grant: any) =>
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

                // if the grant has multiple items in the field and the switch is on, exclude it
                if (excludeGrantsWithMultipleItems && grant[formattedKey].length > 1) {
                    return false
                }

                // if no filter values are selected, all grants match
                if (values?.length === 0) {
                    return true
                }

                if (typeof grant[formattedKey] === 'undefined') {
                    return false
                }

                // if the grant has a single value in the field, check if it matches any of the filter values
                if (typeof grant[formattedKey] === 'string') {
                    return values.includes(grant[formattedKey])
                }

                // if the grant has multiple values in the field, check if any of them match any of the filter values
                return grant[formattedKey].some((element: any) =>
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