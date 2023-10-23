export interface Filter {
    values: string[]
    excludeGrantsWithMultipleItems: boolean
}

export interface Filters {
    [key: string]: Filter
}
