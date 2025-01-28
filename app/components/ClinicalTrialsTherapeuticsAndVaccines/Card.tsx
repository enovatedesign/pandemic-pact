'use client'

import { useContext, useMemo, useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/outline'

import { 
    convertSubCategoryDataToCategoryData, 
    formatPhasesToPrepareForSubCategories,
    prepareClinicalTrialPhasesForResearchSubCategories
} from '@/app/helpers/bar-list'
import { GlobalFilterContext } from '@/app/helpers/filters'
import selectOptions from '../../../data/dist/select-options.json'

import VisualisationCard from '../VisualisationCard'
import ClinicalTrialCategories from './ClinicalTrialCategories'
import ClinicalTrialSubCategories from './ClinicalTrialSubCategories'

const ClinicalTrialsTherapeuticsAndVaccines = () => {
    const [showSubCategories, setShowSubCategories] = useState<boolean>(false)
    
    const { grants } = useContext(GlobalFilterContext)

    // Set the research sub cat filters to ensure we only get the desired subcategories
    const researchSubCatFilters = [
        'Pre-clinical studies',
        'Phase 0 clinical trial',
        'Phase 1 clinical trial',
        'Phase 2 clinical trial',
        'Phase 3 clinical trial',
        'Phase 4 clinical trial',
        'Clinical trial (unspecified trial phase)'
    ]

    // Retrieve the correct subcategories, ensuring the parental relationship is maintained
    const formatResearchCategoryData = (title: string) => {
        const parentCategory = selectOptions['ResearchCat'].find(option =>
            option.label === title
        )

        const subCategories = selectOptions['ResearchSubcat']
            .filter(option => 
                researchSubCatFilters.includes(option.label)
            )
            .filter(({ parent }: { parent: string }) => 
                parent === parentCategory?.value
            )
        
        return {
            label: parentCategory?.label ?? '',
            data: subCategories
        }
    }

    // Retrieve the therapeutics research sub categories
    const therapeuticsData = formatResearchCategoryData(
        'Therapeutics research, development and implementation',
    )

    // Retrieve the Vaccines research sub categories
    const vaccinesResearchData = formatResearchCategoryData(
        'Vaccines research, development and implementation'
    )
    
    const { categoryData, subCategoryData } = useMemo(() => {
        // Prepare the ResearchSubcat select options for the sub category visualisation
        const noneClinicalTrialSubCategoryData = formatPhasesToPrepareForSubCategories(
            grants,
            [therapeuticsData, vaccinesResearchData],
            'ResearchSubcat'
        )

        // Build the subcategory data including both clinical trial and none clinical trial data
        const subCategoryData = [
            ...noneClinicalTrialSubCategoryData,
            // Retrieve the clinical trial data for diagnostics and clinical trials for disease management
            prepareClinicalTrialPhasesForResearchSubCategories('Diagnostics', grants),
            prepareClinicalTrialPhasesForResearchSubCategories('Clinical trials for disease management', grants)
        ]
        
        return {
            // Convert the subcategory data into usable format for standard categories
            // This is done as the none clinical trial data uses select options, and standard functions throughout
            // However the clinical trial categories require a different approach to retrieve the related grants,
            // This ensures we have all the granular detail of subcategories first, and then format for categories
            categoryData: convertSubCategoryDataToCategoryData(subCategoryData),
            subCategoryData
        }
    }, [therapeuticsData, vaccinesResearchData, grants])
    
    const handleClick = () => {
        location.href = '#distribution-of-grants-by-clinical-trial-phase'
        setShowSubCategories(!showSubCategories)
    }

    const infoModalContents = (
        <>
            <p>
                This visualisation represents the research categories and sub-categories associated with clinical research, with all collected funding data aggregated and assigned to the respective categories.
            </p>
        </>
    )
    
    return (
        <VisualisationCard 
            id='distribution-of-clinical-research-grants-by-clinical-trial-phase'
            title='Distribution of Clinical Research Grants by Clinical Trial Phase'
            subtitle="The chart shows the number of grants awarded and the total funding allocated for clinical research across all diseases, categorized by trial intervention focus. Hover over each stacked bar to see a detailed breakdown by focus. Use the ‘View Categories’ button to explore clinical trial phases in more detail by intervention focus."
            infoModalContents={infoModalContents}
            footnote="Note that some clinical research may fall under multiple categories; although, these overlaps are not explicitly shown. For diagnostic trials, preclinical studies are not included in the data presented."
        >
            {!showSubCategories ? (
                <>
                    <ClinicalTrialCategories
                        chartData={categoryData}
                    />
                    <div className="flex justify-end w-full">
                        <button
                            className="self-start text-center font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled text-sm px-4 py-1 lg:text-base uppercase text-white bg-secondary hover:bg-secondary-lighter ignore-in-image-export"
                            onClick={handleClick}
                        >
                            View Categories
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex justify-center items-center w-full">
                        <button onClick={handleClick} className="flex items-center">
                            <span className="cursor-pointer mr-4 bg-brand-grey-200 p-1.5 rounded-md shadow-lg">
                                <ArrowLeftIcon className="size-6 text-brand-grey-500" />
                            </span>
                        </button>

                        <p className="text-brand-grey-500">Viewing All Categories</p>
                    </div>
                    
                    <ClinicalTrialSubCategories subCategories={subCategoryData}/>
                </>
            )}
        </VisualisationCard>
    )
}

export default ClinicalTrialsTherapeuticsAndVaccines