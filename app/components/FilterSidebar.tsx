import {Flex, Text} from "@tremor/react"
import FunderSelect from "./FunderSelect"
import {type Filters} from "../types/filters"

interface FilterSidebarProps {
    selectedFilters: Filters,
    setSelectedFilters: (filters: Filters) => void,
}

export default function FilterSidebar({selectedFilters, setSelectedFilters}: FilterSidebarProps) {
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
                        (FundingOrgName: string[]) => setSelectedFilters({...selectedFilters, FundingOrgName})
                    }
                />
            </Flex>
        </Flex>
    )
}