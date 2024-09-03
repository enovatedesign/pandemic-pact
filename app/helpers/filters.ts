import { createContext } from 'react'
import { every } from 'lodash'

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
}

export function availableFilters(): FilterSchema[] {
    return [
        {
            label: 'Funder',
            field: 'FundingOrgName',
            excludeGrantsWithMultipleItems: { label: 'Exclude Joint Funding' },
        },

        {
            label: 'Disease',
            field: 'Disease',
        },

        {
            label: 'H Antigen',
            field: 'InfluenzaA',
            parent: {
                filter: 'Disease',
                value: '6142004', // Pandemic-prone influenza
            },
        },

        {
            label: 'H1 Subtype',
            field: 'InfluenzaH1',
            parent: {
                filter: 'InfluenzaA',
                value: 'H1',
            },
        },

        {
            label: 'H2 Subtype',
            field: 'InfluenzaH2',
            parent: {
                filter: 'InfluenzaA',
                value: 'H2',
            },
        },

        {
            label: 'H3 Subtype',
            field: 'InfluenzaH3',
            parent: {
                filter: 'InfluenzaA',
                value: 'H3',
            },
        },

        {
            label: 'H5 Subtype',
            field: 'InfluenzaH5',
            parent: {
                filter: 'InfluenzaA',
                value: 'H5',
            },
        },

        {
            label: 'H6 Subtype',
            field: 'InfluenzaH6',
            parent: {
                filter: 'InfluenzaA',
                value: 'H6',
            },
        },

        {
            label: 'H7 Subtype',
            field: 'InfluenzaH7',
            parent: {
                filter: 'InfluenzaA',
                value: 'H7',
            },
        },

        {
            label: 'H10 Subtype',
            field: 'InfluenzaH10',
            parent: {
                filter: 'InfluenzaA',
                value: 'H10',
            },
        },

        {
            label: 'Pathogen Families',
            field: 'Pathogen',
            excludeGrantsWithMultipleItems: {
                label: 'Exclude Grants with Multiple Pathogens',
            },
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
}

export function emptyFilters(fixedDiseaseValue?: string) {
    return Object.fromEntries(
        availableFilters().map(({ field }) => {
            const values =
                field === 'Disease' && fixedDiseaseValue
                    ? [fixedDiseaseValue]
                    : []

            return [
                field,
                {
                    values,
                    excludeGrantsWithMultipleItems: false,
                },
            ]
        }),
    )
}

export function filterGrants(grants: any, filters: any) {
    return grants.filter((grant: any) =>
        every(filters, ({ values, excludeGrantsWithMultipleItems }, key) => {
            // if the grant has multiple items in the field and the switch is on, exclude it
            if (excludeGrantsWithMultipleItems && grant[key].length > 1) {
                return false
            }

            // if no filter values are selected, all grants match
            if (values.length === 0) {
                return true
            }

            if (typeof grant[key] === 'undefined') {
                return false
            }

            // if the grant has a single value in the field, check if it matches any of the filter values
            if (typeof grant[key] === 'string') {
                return values.includes(grant[key])
            }

            // if the grant has multiple values in the field, check if any of them match any of the filter values
            return grant[key].some((element: any) => values.includes(element))
        }),
    )
}

export function countActiveFilters(filters: Filters) {
    return Object.values(filters).filter(filter => filter.values.length > 0)
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

export const SidebarStateContext = createContext<{
    sidebarOpen: boolean
}>({
    sidebarOpen: false,
})

export const FixedDiseaseOptionContext = createContext<{
    label: string
    value: string
    isFixed: boolean
}>({
    label: '',
    value: '',
    isFixed: true
})