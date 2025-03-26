"use client"

import { useMemo, useRef, useState } from 'react'

import hierarchyFilters from '../../../public/manual-hierarchy-filters.json'

import { Filters } from '@/app/helpers/filters'
import { 
    FixedSelectOptions,
    CMSFamilyFilter, 
    CMSPathogenFilter, 
    CMSDiseaseFilter, 
    CMSStrainFilter
} from '@/app/helpers/types'

import CMSFilterSelect from './CMSFilter'
import { uniqBy } from 'lodash'

interface CMSFilterBlockProps {
    selectedFilters: any
    setSelectedOptions: any
    setExcludeGrantsWithMultipleItemsInField?: (
        field: keyof Filters,
        value: boolean,
    ) => void
    fixedSelectOptions?: FixedSelectOptions
    isVisualisePage?: boolean
    outbreak?: boolean
}

const CMSFilterBlock = ({
    selectedFilters,
    setExcludeGrantsWithMultipleItemsInField,
    setSelectedOptions,
    fixedSelectOptions,
    isVisualisePage = true,
    outbreak = false
}: CMSFilterBlockProps) => {
    const [localSelectedOptions, setLocalSelectedOptions] = useState<FixedSelectOptions | undefined>(fixedSelectOptions)

    // Build a dynamic object of refs to be used within 
    // CMSFilter to access specific select options within this components
    const selectRefs = useRef<{ [key: string]: any }>({})

    // Clear the value of the desired react select component using the key
    const clearSelectValue = (key: string) => {
        if (selectRefs.current[key] && selectRefs.current[key].hasValue()) {
            selectRefs.current[key].clearValue()
        }
    }

    const uniqAndSortedFilters = (array: any[]) => {
        const uniqueFilters = uniqBy(array, 'label')
        const labelsToAppend = ['other', 'unspecified']
        const filtersToAppend = uniqueFilters
            .filter(filter => 
                labelsToAppend.includes(filter.label.toLowerCase())
            ).sort((a, b) => 
                a['label'].localeCompare(b['label'])
            )

        const standardFilters = uniqueFilters
            .filter(filter => 
                !labelsToAppend.includes(filter.label.toLowerCase())
            ).sort((a, b) => 
                a['label'].localeCompare(b['label'])
            )

        return [...standardFilters, ...filtersToAppend]
    }
    
    // Each key in the cms filters object is used as the reference for useRef eg: selectRefs['Disease']
    // Once the selected filters have been cleared in the function above, we need to clear the values 
    // within the select component, for each key, clear the value
    const clearAllSelectValuesOnChange = () => {
        Object.keys(cmsFilters).map(key => clearSelectValue(key))
    }

    const { pathogens, diseases, strains } = useMemo(() => {
        let pathogens: CMSPathogenFilter[] = hierarchyFilters
            .flatMap((family: CMSFamilyFilter) => family.pathogens)
            .filter(pathogen => 
                pathogen.label !== 'Other' && 
                pathogen.label !== 'Unspecified'
            )
        let diseases: CMSDiseaseFilter[] = pathogens
            .flatMap((pathogen: CMSPathogenFilter) => pathogen.diseases)
            .filter(disease => 
                disease.label !== 'Other' && 
                disease.label !== 'Unspecified'
            )
        let strains: CMSStrainFilter[] = diseases
            .flatMap((disease: CMSDiseaseFilter) => disease.strains)
            .filter(strain => 
                strain.label !== 'Other' && 
                strain.label !== 'Unspecified'
            )

        if (localSelectedOptions?.Families?.value) {
            const selectedFamily = hierarchyFilters.find(family => family.value === localSelectedOptions.Families.value)
            
            pathogens = uniqAndSortedFilters(selectedFamily?.pathogens || [])
            diseases = uniqAndSortedFilters(pathogens.flatMap(pathogen => pathogen.diseases))
        }

        if (localSelectedOptions?.Pathogens?.value) {
            const selectedPathogen = pathogens.find(pathogen => pathogen.value === localSelectedOptions.Pathogens.value)

            diseases = uniqAndSortedFilters(selectedPathogen?.diseases || []    )
        }

        if (localSelectedOptions?.Diseases?.value) {
            const selectedDisease = diseases.find(disease => disease.value === localSelectedOptions?.Diseases?.value)

            strains = uniqAndSortedFilters(selectedDisease?.strains || [])
        }

        return {
            pathogens, 
            diseases, 
            strains
        }
    }, [localSelectedOptions])

    let cmsFilters = {
        "Family": hierarchyFilters,
        "Pathogen": pathogens,
        "Disease": diseases,
        "Strain": strains // Add strains to the cmsFilters object to ensure that the key is present to clear the values
    }
    
    const handleFilterSelection = (
        field: string, 
        value: string | null
    ) => { 
        if (value === null) {
            setLocalSelectedOptions((prev: any) => ({
                ...prev,
                [field]: { label: '', value: null }
            }))
            
            if (isVisualisePage) {
                clearSelectValue(field)
                setSelectedOptions(field, [])
            } else {
                
                let nullOptions 
                switch (field) {
                    case "Families":
                        nullOptions = { 
                            "Families": { value:  null },
                        }
                        setSelectedOptions(nullOptions)
                        
                        break;
                    case "Pathogens":
                        nullOptions = { 
                            "Pathogens": { value: null },
                        }
                        setSelectedOptions(nullOptions)

                        break;
                    case "Diseases":
                        nullOptions = { 
                            "Diseases": { value: null }, 
                        }
                        setSelectedOptions(nullOptions)

                        break;
                    case "Strains":
                        nullOptions = { 
                            "Strains": { value: null } 
                        }
                        setSelectedOptions(nullOptions)

                        break;
                    default:
                        break;
                }
            }
            
            return
        }

        // Using the local selected options, map over the keys and empty the values array on the corresponding key
        if (localSelectedOptions) {
            Object.keys(localSelectedOptions)
                .forEach(key => setSelectedOptions(key, [])
            )
        }
        
        let fixedOptionsFromSelection
        
        // Based on which select has been modified, build the corresponding hierarchy using the filter arrays
        switch (field) {
            case "Families":
                const selectedFamily = hierarchyFilters.find(filter => filter.value === value)
                
                if (selectedFamily) {
                    clearAllSelectValuesOnChange()

                    // Re build the fixed options based on the selection from the react select component
                    fixedOptionsFromSelection = {
                        "Families": {
                            label: selectedFamily.label,
                            value: selectedFamily.value
                        },
                        "Pathogens": {
                            label: '',
                            value: null
                        },
                        "Diseases": { 
                            label: '',
                            value: null
                        },
                        "Strains": {
                            label: '',
                            value: null
                        }
                    }
                }
                break;

            case "Pathogens":
                const selectedPathogen = pathogens.find(filter => filter.value === value)
                
                if (selectedPathogen) {
                    clearAllSelectValuesOnChange()

                    // Re build the fixed options based on the selection from the react select component
                    fixedOptionsFromSelection = {
                        "Families": { 
                            label: selectedPathogen.family.label,
                            value: selectedPathogen.family.value
                        },
                        "Pathogens": {
                            label: selectedPathogen.label,
                            value: selectedPathogen.value
                        },
                        "Diseases": { 
                            label: '',
                            value: null
                        },
                        "Strains": {
                            label: '',
                            value: null
                        }
                    }

                }
                break;
            
            case "Diseases":
                const selectedDisease = diseases.find(filter => filter.value === value)
                
                if (selectedDisease) {
                    clearAllSelectValuesOnChange()

                    // Re build the fixed options based on the selection from the react select component
                    fixedOptionsFromSelection = {
                        "Families": { 
                            label: selectedDisease.pathogen.family.label,
                            value: selectedDisease.pathogen.family.value
                        }, 
                        "Pathogens": { 
                            label: selectedDisease.pathogen.label,
                            value: selectedDisease.pathogen.value
                        }, 
                        "Diseases": { 
                            label: selectedDisease.label,
                            value: selectedDisease.value
                        },
                        "Strains": {
                            label: '',
                            value: null
                        }
                    } 
                }
                break;

            case "Strains":
                const selectedStrain = strains.find(filter => filter.value === value)
                
                if (selectedStrain) {
                    clearAllSelectValuesOnChange()

                    // Clear the values in the filters
                    // Re build the fixed options based on the selection from the react select component
                    fixedOptionsFromSelection = {
                        "Families": { 
                            label: selectedStrain.disease.pathogen.family.label,
                            value: selectedStrain.disease.pathogen.family.value
                        },
                        "Pathogens": {
                            label: selectedStrain.disease.pathogen.label,
                            value: selectedStrain.disease.pathogen.value
                        },
                        "Diseases": {
                            label: selectedStrain.disease.label,
                            value: selectedStrain.disease.value
                        },
                        "Strains": {
                            label: selectedStrain.label,
                            value: selectedStrain.value
                        }
                    }
                }
                break;
            
            default:
                break;
        }

        // Update the local selected options
        setLocalSelectedOptions(fixedOptionsFromSelection as any)
        
        // Loop over the fixedOptionsFromSelection and apply the corresponding filters
        // State is updated asynchronously so we need to use the updated fixedOptionsFromSelection in this case
        if (fixedOptionsFromSelection) {
            (isVisualisePage ? 
                Object.entries(fixedOptionsFromSelection)
                    .forEach(([key, option]) => {
                        setSelectedOptions(key, option.value !== null ? [option.value] : [])
                    }
                ) : 
                setSelectedOptions(fixedOptionsFromSelection)
            )
        }
    }

    const baseFilters = Object.fromEntries(
        Object.entries(cmsFilters)
            .filter(([key, _]) => 
                key !== "Strain" // Exclude "Strain"
            )
        )
    
    return (baseFilters && Object.values(baseFilters).length > 0) && (
        <>
            <CMSFilterSelect
                filterObject={baseFilters}
                handleFilterSelection={handleFilterSelection}
                selectedFilters={selectedFilters}
                setExcludeGrantsWithMultipleItemsInField={setExcludeGrantsWithMultipleItemsInField}
                isVisualisePage={isVisualisePage}
                fixedSelectOptions={localSelectedOptions}
                outbreak={outbreak}
                selectRefs={selectRefs}
            />

            {localSelectedOptions?.Diseases?.value && strains.length > 0 && (
                <CMSFilterSelect
                    filterObject={{
                        "Strain" : strains
                    }}
                    handleFilterSelection={handleFilterSelection}
                    selectedFilters={selectedFilters}
                    isVisualisePage={isVisualisePage}
                    fixedSelectOptions={localSelectedOptions}
                    outbreak={outbreak}
                    selectRefs={selectRefs}
                />
            )}
        </>
    )
}

export default CMSFilterBlock