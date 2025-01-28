import { createContext } from 'react'
import { Colours, coloursByField } from './colours'
import { sumNumericGrantAmounts } from './reducers'
import selectOptions from '../../data/dist/select-options.json'
import { fromPairs, groupBy, indexOf, orderBy } from 'lodash'


export interface BarListDatum {
    'Title'?: string
    'Category Label': string
    'Category Value': string
    'Grants With Known Financial Commitments': number
    'Grants With Unspecified Financial Commitments': number
    'Known Financial Commitments (USD)': number
    'Total Grants': number
}

export type BarListData = Array<BarListDatum>

export const BarListContext = createContext<{
    data: BarListData
    brightColours: Colours
    dimColours: Colours
    maxTotalNumberOfGrants: number
    maxAmountCommitted: number
}>({
    data: [],
    brightColours: {},
    dimColours: {},
    maxTotalNumberOfGrants: 0,
    maxAmountCommitted: 0,
})

export function getColoursByField(field: string) {
    const brightColours = coloursByField[field as keyof typeof coloursByField].bright

    const dimColours = coloursByField[field as keyof typeof coloursByField].dim

    return { brightColours, dimColours }
}

export function prepareBarListDataForCategory(
    grants: any[],
    category: { value: string; label: string },
    field: string,
    clinicalTrialLabelPrep?: boolean
) {
    const labelPrep = clinicalTrialLabelPrep ?? false

    const grantsWithKnownAmounts = grants
        .filter((grant: any) => grant[field].includes(category.value))
        .filter((grant: any) => typeof grant.GrantAmountConverted === 'number')
    
    const grantsWithUnspecifiedAmounts = grants
        .filter((grant: any) => grant[field].includes(category.value))
        .filter((grant: any) => typeof grant.GrantAmountConverted !== 'number')


    const moneyCommitted = grantsWithKnownAmounts.reduce(
        ...sumNumericGrantAmounts
    )
    
    return {
        'Category Value': category.value,
        'Category Label': labelPrep ? formatClinicalTrialCategoryLabel(category.label) : category.label,
        'Grants With Known Financial Commitments':
            grantsWithKnownAmounts.length,
        'Grants With Unspecified Financial Commitments':
            grantsWithUnspecifiedAmounts.length,
        'Total Grants':
            grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
        'Known Financial Commitments (USD)': moneyCommitted,
    }
}

// Map over the subcategories, maintaining the parent category label, and return the related grants
// using the standard prepareBarListForCategory function from the desired select options
export const formatPhasesToPrepareForSubCategories = (
    grants: any[],
    subCategories: { 
        label: string
        data: { 
            value: string 
            label: string
        }[] 
    }[],
    field: string
) => subCategories.map(subCategory => ({
        label: subCategory.label,
        data: subCategory.data.map(category => prepareBarListDataForCategory(
            grants, 
            category,
            field, 
            true
        ))
    })
)

export const isChartDataUnavailable = (data: BarListDatum[]) => {
    return data.every((data) => 
        data['Grants With Known Financial Commitments'] === 0 &&
        data["Grants With Unspecified Financial Commitments"] === 0 &&
        data["Known Financial Commitments (USD)"] === 0 && 
        data["Total Grants"] === 0
    )
}


type ClinicalTrialData = Record<
    "Therapeutics research, development and implementation" |
    "Vaccines research, development and implementation" |
    "Diagnostics" |
    "Clinical trials for disease management",
    number
>

export const isClinicalTrialCategoryDataUnavailable = (data: ClinicalTrialData[]): boolean => {
    return data.every((item) => 
        Object.values(item).every((value) => value === 0)
    )
}


type DataItem = {
    label: string
    data: any[]
}

type CategoryData = Record<
    string,
    Record<string, string | number>
>

export const convertSubCategoryDataToCategoryData = (data: DataItem[]) => {
    const totalGrantsCategoryData: CategoryData = {}
    const totalFinancialCommitmentsCategoryData: CategoryData = {}

    // Process each data item
    data.forEach(({ label, data }) => {
        data.forEach(({ "Category Label": categoryLabel, "Total Grants": totalGrants, "Known Financial Commitments (USD)": financialCommitments }) => {
            // Initialize the category if it doesn't exist
            if (!totalGrantsCategoryData[categoryLabel]) {
                totalGrantsCategoryData[categoryLabel] = { "Category Label": categoryLabel }
            }
            if (!totalFinancialCommitmentsCategoryData[categoryLabel]) {
                totalFinancialCommitmentsCategoryData[categoryLabel] = { "Category Label": categoryLabel }
            }

            // Add the data to the respective objects
            totalGrantsCategoryData[categoryLabel][label] = totalGrants;
            totalFinancialCommitmentsCategoryData[categoryLabel][label] = financialCommitments
        })
    })

    return {
        totalGrantsCategoryData,
        totalFinancialCommitmentsCategoryData,
    }
}

// Return a formatted label to ensure consistency across non-clinical trial and clinical trial data
export const formatClinicalTrialCategoryLabel = (label: string): string => {
    const mappings: { regex: RegExp; formattedLabel: string }[] = [
        { regex: /Pre-clinical studies/i, formattedLabel: 'Pre-clinical studies' },
        { regex: /Phase 0 clinical trial|Protocol/i, formattedLabel: 'Phase 0' },
        { regex: /Phase 1 clinical trial|Clinical Trial, Phase I\b/i, formattedLabel: 'Phase 1' },
        { regex: /Phase 2 clinical trial|Clinical Trial, Phase II\b/i, formattedLabel: 'Phase 2' },
        { regex: /Phase 3 clinical trial|Clinical Trial, Phase III\b/i, formattedLabel: 'Phase 3' },
        { regex: /Phase 4 clinical trial|Clinical Trial, Phase IV\b/i, formattedLabel: 'Phase 4' },
        { 
            regex: /Controlled Clinical Trial\b|Randomized Controlled Trial|Unspecified/i, 
            formattedLabel: 'Unspecified phase' 
        }
    ];

    // Find the first mapping that matches the label and return the formatted label
    for (const { regex, formattedLabel } of mappings) {
        if (regex.test(label)) {
            return formattedLabel
        }
    }

    // Return the original label if no match is found
    return label
}

export const prepareClinicalTrialPhasesForResearchSubCategories = (subCategoryLabel: string, grants: any[]) => {
    // Set the clinical trial sub category filters to ensure we only get the desired clinical trial subcategories
    const clinicalTrialSubCatFilters = {
        "1": 'Protocol',
        "2": 'Clinical Trial, Phase I',
        "3": 'Clinical Trial, Phase II',
        "4": 'Clinical Trial, Phase III',
        "5": 'Clinical Trial, Phase IV',
        "7": 'Controlled Clinical Trial',
        "8": 'Randomized Controlled Trial',
        "-99": 'Unspecified',
    }

    // Set the order of the phases (this is from the formatted titles)
    const phaseOrder = [
        "Pre-clinical studies",
        "Phase 0",
        "Phase 1",
        "Phase 2",
        "Phase 3",
        "Phase 4",
        "Unspecified phase"
    ]

    // Retrieve the value of 'Clinical' from the select options
    const clinicalStudyTypeValue = selectOptions['StudyType']
        .find(option => option.label === 'Clinical')?.value
    
    // Retrieve the desired subcategory from ResearchSubCat select options (including label and value)
    // eg. 'Disease'
    const subCategory = selectOptions['ResearchSubcat']
        .find(option => option.label === subCategoryLabel)
    
    // Retrieve the desired clinical trial select options 
    const clinicalTrialOptions = selectOptions['ClinicalTrial']
        .filter(option => Object.values(clinicalTrialSubCatFilters).includes(option.label))

    // Filter the grants down to 'study type', with a researchSubcat filter to the desired sub category
    // ensure we are only retrieving the grants related to the clinical trial categories
    const clinicalTrialGrants = grants.filter(grant => (
        grant['ResearchSubcat'].includes(subCategory?.value) && 
        grant['StudyType'].includes(clinicalStudyTypeValue) && 
        grant['ClinicalTrial'].some((trialValue: string) => 
            // Create an array of clinical trial option values
            clinicalTrialOptions.map(option => option.value).includes(trialValue)
        )
    ))
    
    // flatMap over the grants and then map over the clinical trial array to produce an array of grants where each clinical trial within the array is counted
    // Group the array of grants by the Category Label
    const clinicalTrialGrantsGroupedByCategoryLabel = groupBy(clinicalTrialGrants.flatMap(grant => {
        // Format the label to ensure consistency between none clinical trial and clinical trial data
        // This is necessary as the data displays the clinical trial phases differently
        
        return grant['ClinicalTrial'].map((trial: string) => {
            const clinicalTrialLabel = formatClinicalTrialCategoryLabel(clinicalTrialSubCatFilters[trial as keyof typeof clinicalTrialSubCatFilters])
            return {
                'Category Label': clinicalTrialLabel,
                'Category Value': trial,
                ...grant
            }
        }) 
    }), 'Category Label')

    // Check if the keys of the grouped data exists in the phase order, if it doesn't, return an empty array
    // This allows the key to be set to the related key, and value of related grants to be set to 0 (empty array)
    const groupedDataWithMissingDataDefaults = fromPairs(
        phaseOrder.map(phase => [
            phase,
            clinicalTrialGrantsGroupedByCategoryLabel[phase] || []
        ])
    )
    
    // Map over the grouped object, and put include the formatted clinical trial phase in the data (BarListDatum type)
    // This is necessary to ensure we can handle the colours of the visualisation based on their phase
    const subCategoryChartData = Object.entries(groupedDataWithMissingDataDefaults).map(([phase, grants]) => {
        const grantsWithKnownAmounts = grants.filter(grant => typeof grant['GrantAmountConverted'] === 'number')
        const grantsWithUnspecifiedAmounts = grants.filter(grant => typeof grant['GrantAmountConverted'] !== 'number')

        const moneyCommitted = grantsWithKnownAmounts.reduce(
            ...sumNumericGrantAmounts
        )
        
        return {
            'Category Label': phase,
            'Category Value': phase,
            'Grants With Known Financial Commitments': grantsWithKnownAmounts.length,
            'Grants With Unspecified Financial Commitments': grantsWithUnspecifiedAmounts.length,
            'Total Grants': grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
            'Known Financial Commitments (USD)': moneyCommitted,
        }
    })
    
    const orderedSubCategoryChartData = orderBy(
        subCategoryChartData, 
        (item: BarListDatum) => indexOf(
            phaseOrder, 
            item["Category Label"]
        ), 
        ['asc']
    )
    
    return {
        label: subCategoryLabel,
        data: orderedSubCategoryChartData
    }
}