import Switch from "./Switch"

import { FilterSchema, Filters } from "../helpers/filters"

import { IndentMultiSelect } from "./FilterSidebar"
import ConditionalWrapper from "./ConditionalWrapper"
import MultiSelect from "./MultiSelect"

interface filterBlockProps {
    filters: FilterSchema[]
    selectedFilters: Filters
    setSelectedOptions: (field: keyof Filters, options: string[]) => void
    setExcludeGrantsWithMultipleItemsInField: (
        field: keyof Filters,
        value: boolean,
    ) => void
    sharedFiltersId?: string | null
}

const FilterBlock = ({
    filters,
    selectedFilters,
    setExcludeGrantsWithMultipleItemsInField,
    setSelectedOptions,
    sharedFiltersId
}: filterBlockProps) => filters.map(({ 
    field, 
    label, 
    excludeGrantsWithMultipleItems, 
    parent, 
    loadOnClick, 
    isHidden 
}) => {
    return !isHidden && (    
        <ConditionalWrapper
            condition={parent != undefined}
            key={field}
            wrapper={children => <IndentMultiSelect>{children}</IndentMultiSelect>}
        >  
            <div className="flex flex-col space-y-2 w-full" key={field}>
                <p className="text-white">Filter by {label}</p>

                <MultiSelect
                    field={field}
                    selectedOptions={selectedFilters[field].values}
                    setSelectedOptions={options =>
                        setSelectedOptions(field, options)
                    }
                    loadOnClick={sharedFiltersId ? 
                        false : 
                        loadOnClick ?? true
                    }
                    label={label}
                />

                {excludeGrantsWithMultipleItems && (
                    <Switch
                        checked={
                            selectedFilters[field]
                            .excludeGrantsWithMultipleItems
                        }
                        onChange={value =>
                            setExcludeGrantsWithMultipleItemsInField(
                                field,
                                value,
                            )
                        }
                        label={excludeGrantsWithMultipleItems.label}
                        textClassName="text-white"
                    />
                )}
            </div>
        </ConditionalWrapper>
    )
})

export default FilterBlock