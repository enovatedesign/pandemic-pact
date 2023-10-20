import {every} from 'lodash'

export function availableFilters() {
    return [
        {
            field: 'FundingOrgName',
            label: 'Funder',
            excludeGrantsWithMultipleItemsInFieldSwitch: {label: 'Exclude Joint Funding'}
        },

        {
            field: 'ResearchInstitutionName',
            label: 'Research Institution'
        },

        {
            field: 'Disease',
            label: 'Disease'
        },

        {
            field: 'Pathogen',
            label: 'Pathogen',
            excludeGrantsWithMultipleItemsInFieldSwitch: {label: 'Exclude Grants with Multiple Pathogens'}
        },

        {
            field: 'GrantStartYear',
            label: 'Year'
        },

        {
            field: 'StudySubject',
            label: 'Study Subject'
        },

        {
            field: 'AgeGroups',
            label: 'Age Group'
        },

        {
            field: 'StudyType',
            label: 'Study Type'
        }
    ]
}

export function emptyFilters() {
    return Object.fromEntries(
        availableFilters().map(
            ({field}) => ([
                field,
                {values: [], excludeGrantsWithMultipleItemsInField: false}
            ])
        )
    )
}

export function filterGrants(grants: any, selectedFilterGroups: any) {
    return grants.filter(
        (grant: any) => every(
            selectedFilterGroups,
            ({values}, key) => (values.length === 0) || grantMatchesFilter(grant, values, key)
        )
    )
}

function grantMatchesFilter(grant: any, selectedFilters: any, key: string) {
    return (typeof grant[key] === "string") ?
        selectedFilters.includes(grant[key]) :
        grant[key].some((element: any) => selectedFilters.includes(element))
}
