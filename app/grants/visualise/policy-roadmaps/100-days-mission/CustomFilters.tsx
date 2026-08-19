"use client"

import { useEffect, useMemo, useState } from "react"

import selectOptions from '@/data/dist/select-options.json'

import Select from "@/app/components/Select"
import { Filters } from "@/app/helpers/filters"
import ConditionalWrapper from "@/app/components/ConditionalWrapper"
import { IndentMultiSelect } from "@/app/components/FilterSidebar"

type Option = {
    label: string
    value: string
}

interface CustomFilterProps {
    selectedFilters: Filters
    setSelectedFilters: (filters: Filters) => void
}

const CustomFilters = ({ 
    selectedFilters,
    setSelectedFilters 
}: CustomFilterProps) => {
    const [selectedStudyPopulation, setSelectedStudyPopulation] = useState<Option | null>(null)
    const [selectedStudyPopulationFilter, setSelectedStudyPopulationFilter] = useState<Option | null>(selectedStudyPopulation)

    const demographicOptions = selectOptions['HundredDaysMissionStudyPopulation']
    const selectedStudyPopulationOptions = useMemo(() => 
        selectOptions[selectedStudyPopulation?.value as keyof typeof selectOptions], 
        [selectedStudyPopulation]
    )

    const handleStudyPopulationChange = (option?: Option) => {
        let selectedOptions: Filters = { ...selectedFilters }

        if (selectedStudyPopulation?.value) {
            selectedOptions[selectedStudyPopulation?.value].values = []
            
            setSelectedFilters(selectedOptions)
        }

        setSelectedStudyPopulationFilter(null)
        
        if (option) {
            setSelectedStudyPopulation(option)
        } else {
            setSelectedStudyPopulation(null)
        } 
    }

    const setSelectedOptions = (option?: Option) => {
        if (option) {
            setSelectedStudyPopulationFilter(option)
    
            let selectedOptions: Filters = { ...selectedFilters }
            
            if (selectedStudyPopulation?.value) {
                if (!selectedOptions[selectedStudyPopulation?.value]) {
                    selectedOptions[selectedStudyPopulation?.value] = { values: [], excludeGrantsWithMultipleItems: false }
                }
        
                selectedOptions[selectedStudyPopulation?.value].values = [option.value]
                setSelectedFilters(selectedOptions)
            }
        }
    }

    // Both selects are local state, so a filter set applied from outside this
    // component — a shared ?share= link, or Clear All — has to be mirrored back
    // into them or they show nothing while the filter is still applied.
    useEffect(() => {
        const appliedDemographic = demographicOptions.find(
            (option: Option) => (selectedFilters[option.value]?.values?.length ?? 0) > 0
        )

        if (appliedDemographic) {
            const appliedValue = selectedFilters[appliedDemographic.value].values[0]
            const options = selectOptions[
                appliedDemographic.value as keyof typeof selectOptions
            ] as Option[] | undefined

            setSelectedStudyPopulation(appliedDemographic)
            setSelectedStudyPopulationFilter(
                options?.find(option => option.value === appliedValue) ?? null
            )

            return
        }

        const allFiltersHaveBeenCleared = Object.values(selectedFilters)
            .flatMap(selectedFilter => 
                selectedFilter['values']
            ).length === 0
        
        if (allFiltersHaveBeenCleared) {
            setSelectedStudyPopulation(null)
            setSelectedStudyPopulationFilter(null)
        }
    }, [selectedFilters, demographicOptions])

    const filterCondition = selectedStudyPopulationOptions && (selectedStudyPopulationOptions.length > 0)

    return (
        <div className="flex flex-col space-y-2 w-full">
            <div className="flex flex-col space-y-2 w-full">
                <p className="text-white">Filter by Study Population</p>
                
                <Select
                    label={'All Study Population'}
                    value={selectedStudyPopulation}
                    options={demographicOptions}
                    onChange={(option) => handleStudyPopulationChange(option ?? undefined)}
                    className="w-full text-black"
                    isClearable 
                />
            </div>
                
            {filterCondition && (
                <ConditionalWrapper 
                    wrapper={children => <IndentMultiSelect>{children}</IndentMultiSelect>}
                    condition={filterCondition}
                >
                    <div className="flex flex-col space-y-2 w-full">
                        <p className="text-white">Filter by {selectedStudyPopulation?.label}</p>
                        
                        <Select
                            label={`All ${selectedStudyPopulation?.label}`}
                            value={selectedStudyPopulationFilter}
                            options={selectedStudyPopulationOptions}
                            onChange={(option) => setSelectedOptions(option ?? undefined)}
                            className="w-full text-black"
                        />
                    </div>
                </ConditionalWrapper>
            )}
        </div>
    )
}

export default CustomFilters