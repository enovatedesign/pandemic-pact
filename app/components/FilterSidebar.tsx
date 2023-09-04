import FunderSelect from "./FunderSelect"
import {type Filters} from "../types/filters"

interface FilterSidebarProps {
    selectedFilters: Filters,
    setSelectedFilters: (filters: Filters) => void,
}

export const FilterSidebar = ({selectedFilters, setSelectedFilters}: FilterSidebarProps) => {
    return (
        <FunderSelect
            setSelectedFunders={
                (funders: string[]) => setSelectedFilters({...selectedFilters, funders})
            }
        />
    )
}
