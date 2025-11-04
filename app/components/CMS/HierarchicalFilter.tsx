"use client"
import { useContext } from 'react'

import Select from 'react-select'

import { customSelectThemeColours } from '@/app/helpers/select-colours'
import { Filters, FixedSelectOptionContext } from '@/app/helpers/filters'
import { FixedSelectOptions } from '@/app/helpers/types'

import Switch from '../Switch'
import ConditionalWrapper from '../ConditionalWrapper'
import { IndentMultiSelect } from '../FilterSidebar'

interface HierarchicalFilterProps {
    filterObject: Record<string, any[]>
    handleFilterSelection: (field: string, value: string) => void
    selectedFilters: Filters
    setExcludeGrantsWithMultipleItemsInField?: (
        field: keyof Filters,
        value: boolean,
    ) => void
    isVisualisePage?: boolean
    fixedSelectOptions?: FixedSelectOptions
    outbreak?: boolean
    valuesHaveBeenCleared?: boolean
    selectRefs: any
}

const HierarchicalFilter = ({
    filterObject, 
    handleFilterSelection,
    selectedFilters,
    setExcludeGrantsWithMultipleItemsInField,
    isVisualisePage = true,
    fixedSelectOptions,
    outbreak = false,
    selectRefs
}: HierarchicalFilterProps) => {
    const { outbreakLevel } = useContext(FixedSelectOptionContext)

    const fieldMapping = {
        "Family": "Families",
        "Pathogen": "Pathogens",
        "Disease": "Diseases",
        "Strain": "Strains"
    }

    const selectWrapperClasses = [
        'w-full flex',
        !isVisualisePage ? 'flex-row items-center gap-x-2' : 'flex-col gap-y-2'
    ].filter(Boolean).join(' ')
    
    return (
        <>
            {Object.entries(filterObject).map(([key, filters]) => {
                const fullLabel = `All ${key}`
                // The key is the singular form, while the field in the data is plural.  
                // Use the mapping to retrieve the correct field name.
                let field = fieldMapping[key as keyof typeof fieldMapping]

                const excludeGrantsWithMultipleItems = field === 'Pathogens'
                
                let fixedOption
                let level

                if (fixedSelectOptions) {
                    // Using the data in fixedSelectOptions, find the corresponding entry within the filters array
                    fixedOption = filters.find(filter => 
                        filter.value === fixedSelectOptions[field as keyof typeof fixedSelectOptions]?.value
                    )
                }

                if (outbreakLevel) {
                    level = outbreakLevel
                }

                const disabled = outbreak && fixedOption && ((level === 3 && field !== "Strains") || level === 4)
                
                return (
                    <ConditionalWrapper
                        condition={(field !== "Families" && isVisualisePage)}
                        wrapper={children => <IndentMultiSelect>{children}</IndentMultiSelect>}
                        key={key}
                    > 
                        <div className={selectWrapperClasses}>
                            {isVisualisePage && (
                                <p className="text-white">Filter by {key}</p>
                            )}

                            {(!isVisualisePage && (field !== "Families")) && (
                                <svg 
                                    viewBox="0 0 448 512" 
                                    className="size-4 fill-current text-primary "
                                >
                                    <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
                                </svg>
                            )}

                            <Select
                                ref={(el: any) => (selectRefs.current[key] = el)} 
                                options={filters}
                                onChange={(option) => {
                                    // If option.value is present, set the filter, if it does not exist, option === null
                                    // If option is null, this indicates the value has been cleared
                                    // We need access to this information in CMSFilterBlock to handle this logic
                                    handleFilterSelection(field, option?.value ? option.value : option)
                                }}
                                value={fixedOption}
                                placeholder={fullLabel}
                                aria-label={fullLabel}
                                className="text-black w-full"
                                theme={(theme: any) => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        ...customSelectThemeColours,
                                    },
                                })}
                                isDisabled={disabled}
                                isClearable={true}
                            />

                            {
                                excludeGrantsWithMultipleItems && 
                                setExcludeGrantsWithMultipleItemsInField && 
                                isVisualisePage && (
                                    <Switch
                                        checked={selectedFilters[field].excludeGrantsWithMultipleItems}
                                        onChange={value => {
                                            setExcludeGrantsWithMultipleItemsInField(
                                                field,
                                                value,
                                            )
                                        }}
                                        label="Exclude Grants with Multiple Pathogens"
                                        textClassName="text-white"
                                    />
                                )
                            }
                        </div>
                    </ConditionalWrapper>
                )
            })}
        </>
    )
}

export default HierarchicalFilter