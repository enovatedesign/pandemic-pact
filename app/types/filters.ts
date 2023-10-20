export interface Filter {
    values: string[]
    excludeGrantsWithMultipleItemsInField: boolean
}

export interface Filters {
    [key: string]: Filter
}
