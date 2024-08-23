import { useState } from 'react'
import { XIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid'
import MultiSelect from './MultiSelect'
import Switch from './Switch'
import Button from './Button'
import { availableFilters, emptyFilters, Filters } from '../helpers/filters'
import AnimateHeight from 'react-animate-height'
import LoadingSpinner from './LoadingSpinner'

interface FilterSidebarProps {
    selectedFilters: Filters
    setSelectedFilters: (filters: Filters) => void
    completeDataset: any[]
    globallyFilteredDataset: any[]
    loadingDataset?: boolean
    fixedDiseaseOption?: {
        label: string
        value: string
    }[]
}

export default function FilterSidebar({
    selectedFilters,
    setSelectedFilters,
    completeDataset,
    globallyFilteredDataset,
    loadingDataset,
    fixedDiseaseOption,
}: FilterSidebarProps) {
    const [showAdvancedFilters, setShowAdvancedFilters] =
        useState<boolean>(false)

    const filters = availableFilters()
    let standardFilters = filters.filter(f => !f.advanced)
    const advancedFilters = filters.filter(f => f.advanced)

    // If fixed disease options exists, modify standrad filters to remove 'Pathogen'
    // The Disease filter must remain to allow maniupulation of this field within the multi select
    if (fixedDiseaseOption && fixedDiseaseOption.length > 0) {
        standardFilters = standardFilters.filter(f => f.field !== 'Pathogen')
    }

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
                fixedDiseaseOption={fixedDiseaseOption}
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
                    onClick={() => setSelectedFilters(emptyFilters())}
                >
                    Clear All <XIcon className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}

interface filterBlockProps {
    filters: {
        field: string
        label: string
        advanced?: boolean
        excludeGrantsWithMultipleItems?: { label: string }
    }[]
    selectedFilters: Filters
    setSelectedOptions: (field: keyof Filters, options: string[]) => void
    setExcludeGrantsWithMultipleItemsInField: (
        field: keyof Filters,
        value: boolean,
    ) => void
    fixedDiseaseOption?: {
        label: string
        value: string
    }[]
}

const FilterBlock = ({
    filters,
    selectedFilters,
    setExcludeGrantsWithMultipleItemsInField,
    setSelectedOptions,
    fixedDiseaseOption,
}: filterBlockProps) => {
    return (
        <>
            {filters.map(({ field, label, excludeGrantsWithMultipleItems }) => {
                let srOnlyText = null

                if (fixedDiseaseOption && fixedDiseaseOption.length > 0) {
                    srOnlyText = `Active ${label} filter`
                    if (fixedDiseaseOption.length === 1) {
                        srOnlyText += ` is: ${fixedDiseaseOption[0].label}`
                    } else {
                        srOnlyText += `s are: ${fixedDiseaseOption
                            .map(disease => disease.label)
                            .join(', ')}`
                    }
                }

                return (
                    <div className="flex flex-col space-y-2 w-full" key={field}>
                        {fixedDiseaseOption && label === 'Disease' ? (
                            <>
                                <p className="sr-only">{srOnlyText}</p>

                                <MultiSelect
                                    field={field}
                                    selectedOptions={
                                        selectedFilters[field].values
                                    }
                                    setSelectedOptions={options =>
                                        setSelectedOptions(field, options)
                                    }
                                    fixedDiseaseOption={fixedDiseaseOption}
                                    className="hidden"
                                />
                            </>
                        ) : (
                            <>
                                <p className="text-white">Filter by {label}</p>

                                <MultiSelect
                                    field={field}
                                    selectedOptions={
                                        selectedFilters[field].values
                                    }
                                    setSelectedOptions={options =>
                                        setSelectedOptions(field, options)
                                    }
                                />
                            </>
                        )}

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
                )
            })}
        </>
    )
}
