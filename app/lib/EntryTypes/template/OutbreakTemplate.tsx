'use client'

import VisualisePageClient from "../../../visualise/VisualisePageClient"
import Matrix from "../../../components/ContentBuilder"
import { AnnouncementProps, CMSDiseaseFilter, CMSStrainFilter } from "@/app/helpers/types"
import { FixedSelectOptionContext } from '@/app/helpers/filters'
import { useMemo, useState } from "react"
import hierarchyFilters from '../../../../public/manual-hierarchy-filters.json'

interface Props {
    data: any
    announcement: AnnouncementProps
}

export default function OutbreakTemplate({data, announcement}: Props) {
    const [outbreakLevel, setOutbreakLevel] = useState<number>(3)
    
    const { entry } = data

    const outbreakLabel = entry.outbreakDisease
    
    const outbreakSelectOptions = useMemo(() => (
        buildOutbreakHierarchyStructure(outbreakLabel, setOutbreakLevel)
    ), [outbreakLabel])
    
    const outbreakContext = {
        outbreakSelectOptions,
        outbreakLevel
    }

    return (
        <FixedSelectOptionContext.Provider value={outbreakContext}>
            <VisualisePageClient
                outbreak={true}
                diseaseLabel={outbreakLabel}
                title={`OUTBREAK: ${entry.title}`}
                summary={entry.summary}
                showSummary={entry.showSummary}
                announcement={announcement}
            >
                {entry.bodyContent && entry.bodyContent.length > 0 && (
                    <Matrix blocks={entry.bodyContent} />
                )}
            </VisualisePageClient>
        </FixedSelectOptionContext.Provider>
    )
}

const buildOutbreakHierarchyStructure = (outbreakLabel: string, setOutbreakLevel: (level: number) => void) => {
    // Define base structure for hierarchy with blank labels and values
    let structure = {
        "Families": { label: '', value: '' },
        "Pathogens": { label: '', value: '' },
        "Diseases": { label: '', value: '' },
        "Strains": { label: '', value: '' }
    }
    
    // Map the disease and strain options to a variable
    const diseases: CMSDiseaseFilter[] = hierarchyFilters.flatMap(family => family.pathogens).flatMap(pathogen => pathogen.diseases)
    const strains: CMSStrainFilter[] = diseases.flatMap(disease => disease.strains)

    let level = 3 // Default disease level
    // Attempt to find the disease at the standard disease level
    let outbreak: CMSDiseaseFilter | CMSStrainFilter | undefined = diseases.find(disease => disease.label === outbreakLabel) 

    // If the disease doesnt exist, look at the strain level
    if (typeof outbreak === 'undefined') {
        outbreak = strains.find(strain => strain.label === outbreakLabel)

        // If the disease exists at the strain level, set the level to 4
        if (outbreak) {
            level = 4
        }
    }

    setOutbreakLevel(level)
    // Build the structure to handle selected outbreaks from either disease or strain levels
    if (outbreak) {
        switch (level) {
            // Disease
            case 3:
                // Assign the correct types for this use case
                const diseaseOutbreak = outbreak as CMSDiseaseFilter
                structure = {
                    ...structure,
                    "Families": {
                        label: diseaseOutbreak.pathogen.family.label,
                        value: diseaseOutbreak.pathogen.family.value
                    },
                    "Pathogens": {
                        label: diseaseOutbreak.pathogen.label,
                        value: diseaseOutbreak.pathogen.value
                    },
                    "Diseases": {
                        label: diseaseOutbreak.label,
                        value: diseaseOutbreak.value
                    }
                } 
                break;
            
            // Strain
            case 4:
                // Assign the correct types for this use case
                const strainOutbreak = outbreak as CMSStrainFilter
                structure = {
                    "Families": {
                        label: strainOutbreak.disease.pathogen.family.label,
                        value: strainOutbreak.disease.pathogen.family.value
                    },
                    "Pathogens": {
                        label: strainOutbreak.disease.pathogen.label,
                        value: strainOutbreak.disease.pathogen.value
                    },
                    "Diseases": {
                        label: strainOutbreak.disease.label,
                        value: strainOutbreak.disease.value
                    },
                    "Strains": {
                        label: strainOutbreak.label, 
                        value: strainOutbreak.value
                    }
                } 
                break;
        
            default:
                structure
                break;
        }
    }

    return structure
}
