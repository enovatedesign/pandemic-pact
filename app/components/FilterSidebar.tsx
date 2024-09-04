import { useContext, useState } from 'react'
import { XIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid'
import MultiSelect from './MultiSelect'
import Switch from './Switch'
import Button from './Button'
import {
    availableFilters,
    emptyFilters,
    Filters,
    FilterSchema,
    FixedDiseaseOptionContext,
} from '../helpers/filters'
import AnimateHeight from 'react-animate-height'
import LoadingSpinner from './LoadingSpinner'
import ConditionalWrapper from './ConditionalWrapper'

interface FilterSidebarProps {
    selectedFilters: Filters
    setSelectedFilters: (filters: Filters) => void
    completeDataset: any[]
    globallyFilteredDataset: any[]
    loadingDataset?: boolean
}

export function IndentMultiSelect({children}: {children: React.ReactNode}) {
    return (
        <div className="flex gap-2 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="size-6 fill-current text-primary">
                <path d="M334.5 446c8.8 3.8 19 2 26-4.6l144-136c4.8-4.5 7.5-10.8 7.5-17.4s-2.7-12.9-7.5-17.4l-144-136c-7-6.6-17.2-8.4-26-4.6s-14.5 12.5-14.5 22l0 88-192 0c-17.7 0-32-14.3-32-32L96 64c0-17.7-14.3-32-32-32L32 32C14.3 32 0 46.3 0 64L0 208c0 70.7 57.3 128 128 128l192 0 0 88c0 9.6 5.7 18.2 14.5 22z"/>
            </svg>
            {children}
        </div>
    )
}

export default function FilterSidebar({
    selectedFilters,
    setSelectedFilters,
    completeDataset,
    globallyFilteredDataset,
    loadingDataset,
}: FilterSidebarProps) {
    const [showAdvancedFilters, setShowAdvancedFilters] =
        useState<boolean>(false)

    const filters = availableFilters().filter(filter => {
        // Honour conditional filter logic
        if (filter.parent) {
            const parentFilter = selectedFilters[filter.parent.filter]

            // If the parent filter doesn't have exactly one value selected,
            // we don't want to show the child filter
            if (parentFilter.values.length !== 1) {
                return false
            }

            // If the parent has exactly one value but it isn't the value that
            // the child filter is dependent on, we also don't show the child
            if (parentFilter.values[0] !== filter.parent.value) {
                return false
            }

            // Otherwise we will let the filter selection logic proceed
            // as normal, which will show the child unless anything further
            // logic hides it
        }

        // If fixed disease option IS set, keep all filters except 'Pathogen'
        // and 'Disease'
        return !(filter.field === 'Pathogen')
    })

    const standardFilters = filters.filter(f => !f.advanced)

    const advancedFilters = filters.filter(f => f.advanced)

    const setSelectedOptions = (field: keyof Filters, options: string[]) => {
        let selectedOptions: Filters = { ...selectedFilters }

        selectedOptions[field].values = options

        setSelectedFilters(selectedOptions)
    }

    const setExcludeGrantsWithMultipleItemsInField = (
        field: keyof Filters,
        value: boolean,
    ) => {
        let selectedOptions: Filters = { ...selectedFilters }

        selectedOptions[field].excludeGrantsWithMultipleItems = value

        setSelectedFilters(selectedOptions)
    }

    const fixedDiseaseOption = useContext(FixedDiseaseOptionContext)

    return (
        <div className="flex flex-col items-start justify-start gap-y-4">
            <div className="text-white w-full p-4 rounded-xl bg-gradient-to-l from-primary/20 shadow-[inset_0_0_10px_rgba(98,213,209,0.25)]">
                <p className="flex flex-col gap-1">
                    {loadingDataset ? (
                        <>
                            <span className="text-xs font-bold text-gray-300 uppercase">
                                Loading Dataset
                            </span>
                            <LoadingSpinner className="size-9 animate-spin shrink-0 text-primary" />
                        </>
                    ) : (
                        <>
                            {globallyFilteredDataset.length <
                            completeDataset.length ? (
                                <>
                                    <span className="text-xs font-bold text-gray-300 uppercase">
                                        Filtered Grants Total
                                    </span>
                                    <span className="flex flex-row items-end gap-1">
                                        <span className="text-4xl font-bold text-primary">
                                            {globallyFilteredDataset.length}
                                        </span>
                                        <span className="text-lg font-bold text-primary">
                                            {' '}
                                            / {completeDataset.length}
                                        </span>
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-xs font-bold text-gray-300 uppercase">
                                        Total Number Of Grants
                                    </span>
                                    <span className="text-4xl font-bold text-primary">
                                        {completeDataset.length.toLocaleString()}
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </p>
            </div>

            <FilterBlock
                filters={standardFilters}
                selectedFilters={selectedFilters}
                setExcludeGrantsWithMultipleItemsInField={
                    setExcludeGrantsWithMultipleItemsInField
                }
                setSelectedOptions={setSelectedOptions}
            />

            <AnimateHeight
                duration={300}
                height={showAdvancedFilters ? 'auto' : 0}
                className="w-full"
            >
                <div className="flex flex-col items-start justify-start gap-y-4">
                    <FilterBlock
                        filters={advancedFilters}
                        selectedFilters={selectedFilters}
                        setExcludeGrantsWithMultipleItemsInField={
                            setExcludeGrantsWithMultipleItemsInField
                        }
                        setSelectedOptions={setSelectedOptions}
                    />
                </div>
            </AnimateHeight>

            <div className="pb-20 lg:pb-0 flex items-center justify-between w-full">
                <Button
                    size="xsmall"
                    customClasses="mt-3 flex items-center gap-1"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                    {showAdvancedFilters ? (
                        <>
                            Hide Advanced <ChevronUpIcon className="w-5 h-5" />
                        </>
                    ) : (
                        <>
                            Show Advanced{' '}
                            <ChevronDownIcon className="w-5 h-5" />
                        </>
                    )}
                </Button>

                <Button
                    size="xsmall"
                    customClasses="mt-3 flex items-center gap-1"
                    onClick={() =>
                        setSelectedFilters(
                            emptyFilters(fixedDiseaseOption?.value),
                        )
                    }
                >
                    Clear All <XIcon className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}

interface filterBlockProps {
    filters: FilterSchema[]
    selectedFilters: Filters
    setSelectedOptions: (field: keyof Filters, options: string[]) => void
    setExcludeGrantsWithMultipleItemsInField: (
        field: keyof Filters,
        value: boolean,
    ) => void
}

const FilterBlock = ({
    filters,
    selectedFilters,
    setExcludeGrantsWithMultipleItemsInField,
    setSelectedOptions,
}: filterBlockProps) => {

    const fixedDiseaseOption = useContext(FixedDiseaseOptionContext)
    
    return (
        <>
            {filters.map(({ field, label, excludeGrantsWithMultipleItems, parent }) => {

                const influenzaSubType = availableFilters().find(filter => filter.label === 'H5 Subtype')
                
                const childOptions = {
                    "Pandemic-prone influenza": {
                        label: influenzaSubType?.parent?.value,
                        value: influenzaSubType?.parent?.filter,
                        isFixed: false
                    },
                    "H5 Subtype": {
                        label: influenzaSubType?.label,
                        value: influenzaSubType?.field,
                        isFixed: false
                    }
                } as any
                
                const selectedFixedDiseaseOption = fixedDiseaseOption.isFixed && label === 'Disease' 
                    ? fixedDiseaseOption 
                    : parent?.filter === 'Disease' && childOptions[fixedDiseaseOption.label]
                        ? childOptions[fixedDiseaseOption.label]
                        : null

                return (    
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
                                fixedDiseaseOption={selectedFixedDiseaseOption}
                                
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
                )}
            )}
        </>
    )
}
