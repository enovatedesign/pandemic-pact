'use client'

import VisualisePageClient from "../../../visualise/VisualisePageClient"
import selectOptions from "../../../../data/dist/select-options.json"
import Matrix from "../../../components/ContentBuilder"
import { AnnouncementProps, FixedSelectOptions } from "@/app/helpers/types"
import { emptyFilters, FixedSelectOptionContext } from '@/app/helpers/filters'
import { outbreakDiseaseToPathogenFamilyMapping } from "@/scripts/helpers/key-mapping"
import { useMemo } from "react"

interface Props {
    data: any
    announcement: AnnouncementProps
}

interface FixedSelectOptionProps {
    label: string
    value: string
}

export default function OutbreakTemplate({data, announcement}: Props) {
    const {entry} = data

    const diseaseLabel = entry.outbreakDisease

    const fixedDiseaseOption = selectOptions['Disease'].find(
        disease => disease.label === diseaseLabel,
    ) as FixedSelectOptionProps

    // Currently not sure if there is a better way to find the correct family from the data
    // Potential scope to implement content managed hierarchy
    const fixedFamilyOption = selectOptions['Families'].find(pathogen => 
        pathogen.label === outbreakDiseaseToPathogenFamilyMapping[
            fixedDiseaseOption.label as keyof typeof outbreakDiseaseToPathogenFamilyMapping
        ]
    ) ?? null
    
    // If the fixed family option exists, retrieve the corresponding pathogen options
    const pathogenFamilySelectOptions = fixedFamilyOption ?
        selectOptions[`${fixedFamilyOption?.label}Pathogen` as keyof typeof selectOptions] :
        null
        
    // If the pathogen options exist, find the related family based on the disease label
    // eg: Pathogen label = Ebola virus, disease label = Ebola virus disease
    const fixedPathogenFamilyOption = pathogenFamilySelectOptions ? 
        pathogenFamilySelectOptions.find(option => fixedDiseaseOption.label.includes(option.label)) :
        null
    
    let pathogenKey = ''
        
    // Define the dynamic pathogen key to be used in the fixed select options for FixedSelectOptionContext
    if (fixedFamilyOption?.label) {
        pathogenKey = `${fixedFamilyOption?.label}Pathogen`
    }

    // Build the FixedSelectOptionContext
    const fixedSelectOptions = useMemo(() => ({
        "Families": fixedFamilyOption,
        [pathogenKey]: fixedPathogenFamilyOption,
        "Disease": fixedDiseaseOption,
    })as FixedSelectOptions, [fixedDiseaseOption, fixedFamilyOption, fixedPathogenFamilyOption, pathogenKey])
    
    return (
        <FixedSelectOptionContext.Provider value={{ ...fixedSelectOptions }}>
            <VisualisePageClient
                outbreak={true}
                diseaseLabel={diseaseLabel}
                title={`OUTBREAK: ${entry.title}`}
                summary={entry.summary}
                showSummary={entry.showSummary}
                announcement={announcement}
                fixedSelectOptions={fixedSelectOptions}
            >
                {entry.bodyContent && entry.bodyContent.length > 0 && (
                    <Matrix blocks={entry.bodyContent} />
                )}
            </VisualisePageClient>
        </FixedSelectOptionContext.Provider>
    )
}
