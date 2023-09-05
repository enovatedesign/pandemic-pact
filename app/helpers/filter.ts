import {every} from 'lodash'

export function filterGrants(grants: any, selectedFilterGroups: any) {
    return grants.filter(
        (grant: any) => every(
            selectedFilterGroups,
            (selectedFilters, key) => (selectedFilters.length === 0) || selectedFilters.includes(grant[key])
        )
    )
}
