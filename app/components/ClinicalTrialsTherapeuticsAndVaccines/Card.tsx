'use client'

import { useContext, useMemo } from 'react'

import { prepareBarListDataForCategory, formatPhasesToPrepareForCategories } from '@/app/helpers/bar-list'
import { GlobalFilterContext } from '@/app/helpers/filters'
import selectOptions from '../../../data/dist/select-options.json'

import VisualisationCard from '../VisualisationCard'
import ClinicalTrialCategories from './ClinicalTrialCategories'

const ClinicalTrialsTherapeuticsAndVaccines = () => {
    const { grants } = useContext(GlobalFilterContext)

    const researchSubCatFilters = [
        'Pre-clinical studies',
        'Phase 0 clinical trial',
        'Phase 1 clinical trial',
        'Phase 2 clinical trial',
        'Phase 3 clinical trial',
        'Phase 4 clinical trial',
        'Clinical trial (unspecified trial phase)'
    ]

    const clinicalTrialSubCatFilters = [
        'Clinical Trial, Phase I',
        'Clinical Trial, Phase II',
        'Clinical Trial, Phase III',
        'Clinical Trial, Phase IV',
        'Clinical Trial, Veterinary',
        'Controlled Clinical Trial',
        'Randomized Controlled Trial',
        'Randomized Controlled Trial, Veterinary',
        'Unspecified',
    ]

    const formatResearchCategoryData = (title: string) => {
        const parentCategory = selectOptions['ResearchCat'].find(option =>
            option.label === title
        )

        const subCategories = selectOptions['ResearchSubcat']
            .filter(option => 
                researchSubCatFilters.includes(option.label)
            )
            .filter(({ parent }: {parent: string}) => 
                parent === parentCategory?.value
            )
        
        return {
            title: parentCategory?.label,
            subCategories: subCategories
        }
    }

    const formatSubCategoryData = (title: string) => {
        const parentCategory = selectOptions['ResearchSubcat']
            .find(option => 
                option.label === title
            )
        
        const subCategories = selectOptions['ClinicalTrial']
            .filter(option => 
                clinicalTrialSubCatFilters.includes(option.label)
            )
        
        return {
            title: parentCategory?.label,
            subCategories: subCategories
        }
    }
    
    const therapueticsData = formatResearchCategoryData(
        'Therapeutics research, development and implementation',
    )

    const vaccinesResearchData = formatResearchCategoryData(
        'Vaccines research, development and implementation'
    )

    const clinicalData = formatSubCategoryData(
        'Clinical trials for disease management'
    )

    const diagnosticsData = formatSubCategoryData(
        'Diagnostics'
    )
    
    const allData = useMemo(() => {
        return [
            ...therapueticsData.subCategories,
            ...vaccinesResearchData.subCategories,
            ...clinicalData.subCategories,
            ...diagnosticsData.subCategories
        ]
    }, [clinicalData.subCategories, 
        diagnosticsData.subCategories, 
        therapueticsData.subCategories, 
        vaccinesResearchData.subCategories
    ])

    // Set chart data for the bar chart
    const chartData = useMemo(() => {
        const preparedPhaseData = formatPhasesToPrepareForCategories(
            grants,
            allData, 
            'ResearchSubcat'
        )
        return preparedPhaseData
    }, [allData, grants])
    
    return (
        <VisualisationCard 
            id='clinical-trials-Therapeutics-and-vaccines'
            title='Distribution of Grants by Clinical Trial Phase'
        >
            <ClinicalTrialCategories
                chartData={chartData}
            />
        </VisualisationCard>
    )
}

export default ClinicalTrialsTherapeuticsAndVaccines