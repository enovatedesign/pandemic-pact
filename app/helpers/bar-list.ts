import { createContext } from 'react'
import { Colours, coloursByField, hundredDaysMissionResearchAreaBrightColours } from './colours'
import selectOptions from '../../data/dist/select-options.json'
import { groupBy, sumBy } from 'lodash'
import { SelectOption } from '@/scripts/types/generate'
import {
    diagnosticsStageBuckets,
    diagnosticsStageOrder,
    isDiagnosticsD1Grant,
    matchesDiagnosticsStage,
    sharedAxisLabel,
    trialPhaseLabels,
    trialPhaseOrder,
} from './clinical-trial-phases'


export interface BarListDatum {
    'Title'?: string
    'Category Label': string
    'Category Description'?: string
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
    category: { value: string; label: string, description?: string },
    field: string,
    clinicalTrialLabelPrep?: boolean
) {
    const labelPrep = clinicalTrialLabelPrep ?? false
    
    const relatedGrants = grants
        .filter(grant => grant[field].includes(category.value))
        .map(grant => ({
            ...grant,
            GrantAmountConverted: Number(grant['GrantAmountConverted']),
        }))

    const grantsWithKnownAmounts = relatedGrants.filter(grant => grant['GrantAmountConverted'] > 0)
    
    const grantsWithUnspecifiedAmounts = relatedGrants.filter(grant => grant['GrantAmountConverted'] <= 0)

    const moneyCommitted = sumBy(relatedGrants, 'GrantAmountConverted')
    
    return {
        'Category Value': category.value,
        'Category Label': labelPrep ? formatClinicalTrialCategoryLabel(category.label) : category.label,
        ...(category.description ? { 'Category Description': category.description } : {}), // Only add the category description if it exists
        'Grants With Known Financial Commitments':
            grantsWithKnownAmounts.length,
        'Grants With Unspecified Financial Commitments':
            grantsWithUnspecifiedAmounts.length,
        'Total Grants':
            grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
        'Known Financial Commitments (USD)': moneyCommitted,
    }
}

// Merge BarListDatum rows that share the same (formatted) Category Label.
// Used so that subcategories which collapse to the same phase label (e.g. 6b + 6c → "Phase 1")
// are summed into a single row rather than rendered as duplicates.
const mergeBarListRowsByLabel = (rows: BarListDatum[]): BarListDatum[] => {
    const merged = new Map<string, BarListDatum>()

    for (const row of rows) {
        const key = row['Category Label']
        const existing = merged.get(key)

        if (!existing) {
            merged.set(key, { ...row })
        } else {
            existing['Grants With Known Financial Commitments'] += row['Grants With Known Financial Commitments']
            existing['Grants With Unspecified Financial Commitments'] += row['Grants With Unspecified Financial Commitments']
            existing['Total Grants'] += row['Total Grants']
            existing['Known Financial Commitments (USD)'] += row['Known Financial Commitments (USD)']
            existing['Category Value'] = `${existing['Category Value']}, ${row['Category Value']}`
        }
    }

    return Array.from(merged.values())
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
        data: mergeBarListRowsByLabel(
            subCategory.data.map(category => prepareBarListDataForCategory(
                grants,
                category,
                field,
                true
            ))
        )
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
        data.forEach(({ "Category Label": rowLabel, "Total Grants": totalGrants, "Known Financial Commitments (USD)": financialCommitments }) => {
            // Diagnostics words its rows as development stages and the other
            // sections as trial phases, so pivot on the shared axis label to keep
            // the two stacking into one row rather than doubling the rows.
            const categoryLabel = sharedAxisLabel(rowLabel)

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
    // The regexes match raw select-option labels from the source data; only the
    // formatted labels are ours to rename.
    const mappings: { regex: RegExp; formattedLabel: string }[] = [
        { regex: /Pre-clinical studies/i, formattedLabel: trialPhaseLabels.preClinical },
        { regex: /Phase 0 clinical trial|Protocol/i, formattedLabel: trialPhaseLabels.phase1 },
        { regex: /Phase 1 clinical trial|Clinical Trial, Phase I\b/i, formattedLabel: trialPhaseLabels.phase1 },
        { regex: /Phase 2 clinical trial|Clinical Trial, Phase II\b/i, formattedLabel: trialPhaseLabels.phase2 },
        { regex: /Phase 3 clinical trial|Clinical Trial, Phase III\b/i, formattedLabel: trialPhaseLabels.phase3 },
        { regex: /Phase 4 clinical trial|Clinical Trial, Phase IV\b/i, formattedLabel: trialPhaseLabels.phase4 },
        { 
            regex: /Controlled Clinical Trial\b|Randomized Controlled Trial|Unspecified/i, 
            formattedLabel: trialPhaseLabels.unspecified 
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

/**
 * Summarise grants already bucketed by row label into BarListDatum rows.
 *
 * Building straight off phaseOrder does the zero-filling and the ordering in one
 * pass, so a phase with no grants still gets a row.
 */
const summarisePhaseRows = (
    grantsByPhaseLabel: Record<string, any[]>,
    phaseOrder: string[],
): BarListDatum[] =>
    phaseOrder.map(phase => {
        const phaseGrants = (grantsByPhaseLabel[phase] ?? []).map(grant => ({
            ...grant,
            GrantAmountConverted: Number(grant['GrantAmountConverted']),
        }))

        // `> 0` rather than a typeof check: an unknown amount reaches the
        // visualise payload as 0, not as a missing value, so a type test puts
        // every grant in the "known" bucket and flatlines the dim bar.
        const grantsWithKnownAmounts = phaseGrants.filter(
            grant => grant['GrantAmountConverted'] > 0,
        )
        const grantsWithUnspecifiedAmounts = phaseGrants.filter(
            grant => grant['GrantAmountConverted'] <= 0,
        )

        return {
            'Category Label': phase,
            'Category Value': phase,
            'Grants With Known Financial Commitments': grantsWithKnownAmounts.length,
            'Grants With Unspecified Financial Commitments': grantsWithUnspecifiedAmounts.length,
            'Total Grants': phaseGrants.length,
            'Known Financial Commitments (USD)': sumBy(phaseGrants, 'GrantAmountConverted'),
        }
    })

export const prepareClinicalTrialPhasesForResearchSubCategories = (subCategoryLabel: string, grants: any[]) => {
    // Set the clinical trial sub category filters to ensure we only get the desired clinical trial subcategories
    const clinicalTrialSubCatFilters = {
        "2": 'Clinical Trial, Phase I',
        "3": 'Clinical Trial, Phase II',
        "4": 'Clinical Trial, Phase III',
        "5": 'Clinical Trial, Phase IV',
        "7": 'Controlled Clinical Trial',
        "8": 'Randomized Controlled Trial',
        "-99": 'Unspecified',
    }

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

    return {
        label: subCategoryLabel,
        data: summarisePhaseRows(clinicalTrialGrantsGroupedByCategoryLabel, trialPhaseOrder)
    }
}

/**
 * The Diagnostics section of the clinical research visualisation.
 *
 * Diagnostics awards are not coded with a clinical trial phase, so they are
 * placed on the shared axis by D1 development stage instead. That also means
 * they are not gated on StudyType or ClinicalTrial the way the sibling sections
 * are — those gates left all but ~50 of ~1,900 diagnostics awards off the chart.
 *
 * Returns the same shape as prepareClinicalTrialPhasesForResearchSubCategories
 * but words its rows as development stages, so the collapsed chart pivots these
 * rows through sharedAxisLabel to stack them with the trial-phase sections.
 */
export const prepareDiagnosticsDevelopmentStagesSubCategory = (grants: any[]) => {
    const diagnosticsGrants = grants.filter(isDiagnosticsD1Grant)

    const grantsByPhaseLabel = Object.fromEntries(
        diagnosticsStageBuckets.map(({ label, codes }) => [
            label,
            diagnosticsGrants.filter(grant => matchesDiagnosticsStage(grant, codes)),
        ]),
    )

    return {
        label: 'Diagnostics',
        data: summarisePhaseRows(grantsByPhaseLabel, diagnosticsStageOrder),
    }
}

export const prepareBarChartData = (
    grants: any[], 
    field: string, 
    tooltipfield ?:  string, 
    additionalFilterDetails?: { field: string, value: string} | null
) => {
    const options: SelectOption[] = selectOptions[field as keyof typeof selectOptions]
    
    return options.map(({ label, value }) => {
        let relatedGrants = grants
            .filter(grant => grant[field].includes(value))
            .map(grant => ({
                ...grant,
                GrantAmountConverted: Number(grant['GrantAmountConverted']),
            }))

        if (additionalFilterDetails) {
            relatedGrants = relatedGrants.filter(grant => {
                const fieldValue = grant[additionalFilterDetails.field]
                
                return Array.isArray(fieldValue) && fieldValue.includes(additionalFilterDetails.value)
            })
        }

        const grantsWithKnownAmounts = relatedGrants.filter(grant => grant['GrantAmountConverted'] > 0)
        const grantsWithUnspecifiedAmounts = relatedGrants.filter(grant => grant['GrantAmountConverted'] <= 0)
        const moneyCommitted = sumBy(relatedGrants, 'GrantAmountConverted')

        let toolTipData: Record<string, any> = {}
        
        if (tooltipfield) {
            const toolTipOptions = selectOptions[tooltipfield as keyof typeof selectOptions]
            
            toolTipOptions.forEach(({ label, value }) => {
                const toolTipGrants = relatedGrants
                    .filter(grant => 
                        grant[tooltipfield].includes(value)
                    ).map(grant => ({
                        ...grant,
                        GrantAmountConverted: Number(grant['GrantAmountConverted']),
                    }))
                
                toolTipData[label] = {
                    'Colour': '#A6A8AB',
                    'Total Grants': toolTipGrants.length,
                    'Known Financial Commitments (USD)': sumBy(toolTipGrants, 'GrantAmountConverted'),
                }
            })
        }
        
        return {
            'Category Label': label,
            'Category Value': value,
            'Grants With Known Financial Commitments': grantsWithKnownAmounts.length,
            'Grants With Unspecified Financial Commitments': grantsWithUnspecifiedAmounts.length,
            'Total Grants': relatedGrants.length,
            'Known Financial Commitments (USD)': moneyCommitted,
            ...(tooltipfield ? {
                "Tooltip Grants": toolTipData
            } : {})
        }
    }).sort((a: any, b: any) => b['Total Grants'] - a['Total Grants'])
}