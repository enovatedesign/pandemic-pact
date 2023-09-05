import {Flex, Text} from "@tremor/react"
import FunderSelect from "./FunderSelect"
import {type Filters} from "../types/filters"

interface FilterSidebarProps {
    selectedFilters: Filters,
    setSelectedFilters: (filters: Filters) => void,
}

export const FilterSidebar = ({selectedFilters, setSelectedFilters}: FilterSidebarProps) => {
    return (
        <Flex
            flexDirection="col"
            justifyContent="start"
            alignItems="start"
            className="gap-y-4"
        >
            <Flex
                flexDirection="col"
                justifyContent="start"
                alignItems="start"
                className="gap-y-2"
            >
                <Text className="text-white">Filter by Funder</Text>

                <FunderSelect
                    setSelectedFunders={
                        (funders: string[]) => setSelectedFilters({...selectedFilters, funders})
                    }
                />
            </Flex>
        </Flex>
    )
}
