import {Flex, Text, Subtitle} from "@tremor/react"
import {XIcon} from "@heroicons/react/solid"
import MultiSelect from "./MultiSelect"
import Switch from './Switch'
import Button from './Button'
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
        <div className="flex flex-col items-start justify-start gap-y-4">

            <div className="text-white w-full p-4 rounded-xl bg-gradient-to-l from-primary/20 shadow-[inset_0_0_10px_rgba(98,213,209,0.25)]">
        
                <p className="flex flex-col gap-1">
                    {
                        (globallyFilteredDataset.length < completeDataset.length) ? (
                            <>
                                <span className="text-xs font-bold text-gray-300 uppercase">Filtered Grants Total</span>
                                <span className="flex flex-row items-end gap-1">
                                    <span className="text-4xl font-bold text-primary">{globallyFilteredDataset.length}</span>
                                    <span className="text-lg font-bold text-primary"> / {completeDataset.length}</span>
                                </span>
                            </>
                        ) : (
                            <>  
                                <span className="text-xs font-bold text-gray-300 uppercase">Total Number Of Grants</span>
                                <span className="text-4xl font-bold text-primary">{completeDataset.length}</span>
                            </>
                        )
                    }
                </p>
            </div>

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
                        options={selectOptions[field as keyof typeof selectOptions]}
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
                size="xsmall"
                customClasses="mt-3 self-end flex items-center gap-1"
                onClick={() => setSelectedFilters(emptyFilters())}
            >
                Clear All <XIcon className="w-5 h-5" />
            </Button>
        </div>
    )
}
