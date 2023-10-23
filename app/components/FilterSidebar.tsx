import {Button, Flex, Text, Subtitle} from "@tremor/react"
import {XIcon} from "@heroicons/react/solid"
import MultiSelect from "./MultiSelect"
import Switch from './Switch'
import {type Filters} from "../types/filters"
import {availableFilters, emptyFilters} from "../helpers/filter"
import selectOptions from '../../data/dist/select-options.json'

interface FilterSidebarProps {
    selectedFilters: Filters,
    setSelectedFilters: (filters: Filters) => void,
    completeDataset: any[],
    globallyFilteredDataset: any[],
}

export default function FilterSidebar({selectedFilters, setSelectedFilters, completeDataset, globallyFilteredDataset}: FilterSidebarProps) {
    const filters = availableFilters()

    const setSelectedOptions = (field: keyof Filters, options: string[]) => {
        let selectedOptions: Filters = {...selectedFilters}

        selectedOptions[field].values = options

        setSelectedFilters(selectedOptions)
    }

    const setExcludeGrantsWithMultipleItemsInField = (field: keyof Filters, value: boolean) => {
        let selectedOptions: Filters = {...selectedFilters}

        selectedOptions[field].excludeGrantsWithMultipleItems = value

        setSelectedFilters(selectedOptions)
    }

    return (
        <Flex
            flexDirection="col"
            justifyContent="start"
            alignItems="start"
            className="gap-y-4"
        >
            <Subtitle className="text-white">{
                (globallyFilteredDataset.length < completeDataset.length) ?
                    `Filtered Grants: ${globallyFilteredDataset.length} / ${completeDataset.length}` :
                    `Total Grants: ${completeDataset.length}`
            }</Subtitle>

            {filters.map(({field, label, excludeGrantsWithMultipleItems}) => (
                <Flex
                    flexDirection="col"
                    justifyContent="start"
                    alignItems="start"
                    className="gap-y-2"
                    key={field}
                >
                    <Text className="text-white">Filter by {label}</Text>

                    <MultiSelect
                        options={selectOptions[field]}
                        selectedOptions={selectedFilters[field].values}
                        setSelectedOptions={options => setSelectedOptions(field, options)}
                    />

                    {excludeGrantsWithMultipleItems &&
                        <Switch
                            checked={selectedFilters[field].excludeGrantsWithMultipleItems}
                            onChange={value => setExcludeGrantsWithMultipleItemsInField(field, value)}
                            label={excludeGrantsWithMultipleItems.label}
                            textClassName="text-white"
                        />
                    }
                </Flex>
            ))}

            <Button
                onClick={() => setSelectedFilters(emptyFilters())}
                className="mt-4 self-end"
                icon={XIcon}
            >
                Clear All
            </Button>
        </Flex>
    )
}
