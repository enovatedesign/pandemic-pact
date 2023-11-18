import {every} from 'lodash'

export function availableFilters() {
    return [
        {
            field: 'FundingOrgName',
            label: 'Funder',
            excludeGrantsWithMultipleItems: {label: 'Exclude Joint Funding'},
        },

        {
            field: 'ResearchInstitutionName',
            label: 'Research Institution',
        },

        {
            field: 'ResearchLocationCountry',
            label: 'Country',
        },

        {
            field: 'Disease',
            label: 'Disease',
        },

        {
            field: 'Pathogen',
            label: 'Pathogen',
            excludeGrantsWithMultipleItems: {label: 'Exclude Grants with Multiple Pathogens'},
        },

        {
            field: 'GrantStartYear',
            label: 'Year',
        },

        {
            field: 'StudySubject',
            label: 'Study Subject',
        },

        {
            field: 'AgeGroups',
            label: 'Age Group',
        },

        {
            field: 'StudyType',
            label: 'Study Type',
        },
    ]
}

export function emptyFilters() {
    return Object.fromEntries(
        availableFilters().map(
            ({field}) => ([
                field,
                {values: [], excludeGrantsWithMultipleItems: false}
            ])
        )
    )
}

export function filterGrants(grants: any, filters: any) {
    return grants.filter(
        (grant: any) => every(
            filters,
            ({values, excludeGrantsWithMultipleItems}, key) => {
                // if the grant has multiple items in the field and the switch is on, exclude it
                if (excludeGrantsWithMultipleItems && grant[key].length > 1) {
                    return false;
                }

                // if no filter values are selected, all grants match
                if (values.length === 0) {
                    return true;
                }

                // if the grant has a single value in the field, check if it matches any of the filter values
                if (typeof grant[key] === "string") {
                    return values.includes(grant[key])
                }

                // if the grant has multiple values in the field, check if any of them match any of the filter values
                return grant[key].some(
                    (element: any) => values.includes(element)
                )
            }
        )
    )
}
