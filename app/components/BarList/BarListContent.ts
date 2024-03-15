import { createContext } from 'react'

export const BarListContext = createContext<{
    filters: Filters
    grants: any[]
}>({
    filters: emptyFilters(),
    grants: [],
})
