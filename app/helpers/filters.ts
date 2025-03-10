import { createContext } from 'react'
import { every } from 'lodash'
import { FixedSelectOptions, PathogenKey } from './types'

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


export function availableFilters(fixedSelectOptions?: FixedSelectOptions,): FilterSchema[] {
    // Define base filters for pathogen, disease and strain
    let pathogenFilter: FilterSchema = {
        label: 'Pathogen',
        field: 'Pathogens',
        excludeGrantsWithMultipleItems: { 
            label: 'Exclude Grants with Multiple Pathogens' 
        },
    }

    let diseaseFilter: FilterSchema = {
        label: 'Disease',
        field: 'Disease',
        loadOnClick: false,
    }

    let strainFilter: FilterSchema = {
        label: 'Strain',
        field: '',
        loadOnClick: false,
        isHidden: true
    }
    
    // If fixedSelectOptions are present, link the filters to the corresponding parents 
    // Parent values are hard coded for ebola until global hierarchy is implemented
    if (fixedSelectOptions && fixedSelectOptions.Families?.label) {
        pathogenFilter = {
            ...pathogenFilter,
            field: `${fixedSelectOptions.Families.label}Pathogen`,
            parent: {
                filter: 'Families',
                value: '407325004'
            },
            loadOnClick: false,
        }

        diseaseFilter = {
            ...diseaseFilter,
            parent: {
                filter: `${fixedSelectOptions.Families.label}Pathogen`,
                value: '424206003'
            }
        }

        if (fixedSelectOptions.Disease?.value) {
            strainFilter = {
                ...strainFilter,
                field: `${fixedSelectOptions.Families.label}DiseasesStrains`,
                parent: {
                    filter: 'Disease',
                    value: fixedSelectOptions.Disease.value
                },
                loadOnClick: false,
                isHidden: false
            }
        }        
    }

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
        },

        pathogenFilter,

        diseaseFilter,
        
        strainFilter,
        
        {
            label: 'H Antigen',
            field: 'InfluenzaA',
            parent: {
                filter: 'Disease',
                value: '6142004', // Pandemic-prone influenza
            },
            loadOnClick: false,
        },

        {
            label: 'H1 Subtype',
            field: 'InfluenzaH1',
            parent: {
                filter: 'InfluenzaA',
                value: 'h1',
            },
        },

        {
            label: 'H2 Subtype',
            field: 'InfluenzaH2',
            parent: {
                filter: 'InfluenzaA',
                value: 'h2',
            },
        },

        {
            label: 'H3 Subtype',
            field: 'InfluenzaH3',
            parent: {
                filter: 'InfluenzaA',
                value: 'h3',
            },
        },

        {
            label: 'H5 Subtype',
            field: 'InfluenzaH5',
            parent: {
                filter: 'InfluenzaA',
                value: 'h5',
            },
            loadOnClick: false,
        },

        {
            label: 'H6 Subtype',
            field: 'InfluenzaH6',
            parent: {
                filter: 'InfluenzaA',
                value: 'h6',
            },
        },

        {
            label: 'H7 Subtype',
            field: 'InfluenzaH7',
            parent: {
                filter: 'InfluenzaA',
                value: 'h7',
            },
        },

        {
            label: 'H10 Subtype',
            field: 'InfluenzaH10',
            parent: {
                filter: 'InfluenzaA',
                value: 'h10',
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

    return filters
}

export function emptyFilters(
    fixedSelectOptions?: FixedSelectOptions,
    resetFirstChild: boolean = true,
    resetSecondChild: boolean = true,
) {
    const initialFilters = availableFilters(fixedSelectOptions)
    
    const filtersObject = Object.fromEntries(initialFilters.map(({ field, parent }) => {
        let values: string[] = []

        if (fixedSelectOptions) {
            // Retrieve the fixed values from fixedSelectOptions
            const fixedFieldValue = fixedSelectOptions[field as keyof typeof fixedSelectOptions]?.value
            
            // Push the fixed disease into the values array, 
            // this will ensure the value is present on the first page load
            if (fixedFieldValue && fixedFieldValue !== '') {
                values.push(fixedFieldValue)
            }

            if (fixedSelectOptions['Disease'].value) {
                if (field === 'Disease') {
                    values = [fixedSelectOptions['Disease'].value]
                } else if (fixedSelectOptions['Disease'].value === '6142004') {
                    // Pandemic Prone Influenza
                    if (resetFirstChild && field === 'InfluenzaA') {
                        values = ['h5']
                    } else if (resetSecondChild && field === 'InfluenzaH5') {
                        values = ['h5n']
                    }
                }
            }
        }
        
        return [
            field,
            {
                values,
                parent,
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
            ({ values, excludeGrantsWithMultipleItems, parent }, key) => {
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
                if (values.length === 0) {
                    return true
                }

                if (typeof grant[formattedKey] === 'undefined') {
                    return false
                }

                // If the filter has a parent filter, check that it's parent is currently selected
                // before applying it
                if (typeof parent !== 'undefined') {
                    const parentFilterValues = filters[parent.filter].values

                    const childFilterShouldBeApplied =
                        parentFilterValues.length === 1 &&
                        parentFilterValues[0] === parent.value

                    if (!childFilterShouldBeApplied) {
                        return true
                    }
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


export const FixedSelectOptionContext = createContext<{
    "Families": {
        label: string
        value: string
    },
    "Disease": {
        label: string
        value: string
    },

} & {
    [k in PathogenKey]?: {
        label: string
        value: string
    }
}>({
    "Families": {
        label: '',
        value: ''
    },
    "Disease": {
        label: '',
        value: ''
    },
    "FiloviridaePathogen": {
        label: '',
        value: ''
    }
})

