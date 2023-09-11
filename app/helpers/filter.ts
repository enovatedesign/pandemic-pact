import {every} from 'lodash'

export function filterGrants(grants: any, selectedFilterGroups: any) {
    return grants.filter(
        (grant: any) => every(
            selectedFilterGroups,
            (selectedFilters, key) => (selectedFilters.length === 0) || grantMatchesFilter(grant, selectedFilters, key)
        )
    )
}

function grantMatchesFilter(grant: any, selectedFilters: any, key: string) {
    return (typeof grant[key] === "string") ?
        selectedFilters.includes(grant[key]) :
        grant[key].some((element: any) => selectedFilters.includes(element))
}
