import { BarListDatum, prepareBarChartData } from '@/app/helpers/bar-list'
import selectOptions from '../../../../../../data/dist/select-options.json' 
import { sumBy } from 'lodash'

interface Option {
    label: string
    value: string
}

export interface ClinicalTrialsBarList { 
    "Grants With Known Financial Commitments": number, 
    "Grants With Unspecified Financial Commitments": number
    "Total Grants": number
    "Known Financial Commitments (USD)": number
}

// Retrieve the research area select options for global use
const researchAreaOptions = selectOptions['HundredDaysMissionResearchArea']

// Set the desired research area order
const desiredResearchAreaOrder = [
    "Diagnostics",
    "Therapeutics",
    "Vaccines",
    "Clinical characterisation and management"
]

// IDs of clinical trial types to include in the Hundred Days Mission visualization.
const clinicalTrialOptionsToInclude = [
    '2', // Clinical Trial, Phase I
    '3', // Clinical Trial, Phase II
    '4', // Clinical Trial, Phase II
    '5', // Clinical Trial, Phase IV
    '7', // Controlled Clinical Trial
    '8', // Randomized Controlled Trial
]

// The following labels are to be merged into one label named "Unspecified"
const keysToMerge = ["Controlled Clinical Trial", "Randomized Controlled Trial"]

// Formats clinical trial labels for display or data processing.
// Convert "Phase I/II/III/IV" into "Phase 1/2/3/4" for consistency and strip prefixes like "Clinical Trial," if present.
// Return the formatted label.
const formatClinicalTrialsLabel = (label: string) => {
    const labelMapping: Record<string, string> = {
        "Phase I": "Phase 1",
        "Phase II": "Phase 2",
        "Phase III": "Phase 3",
        "Phase IV": "Phase 4",
    }

    // Get the part after a comma if present, otherwise use the full label
    const baseLabel = label.includes(',') ? label.split(',')[1].trim() : label

    // Return mapped label if it exists, otherwise return the base label
    return labelMapping[baseLabel] ?? baseLabel
}

const prepareHundredDaysClinicalTrialData = (grants: any[]) => {
    // Get all clinical trial options and keep only those that are relevant for the Hundred Days Mission visualization
    const filteredClinicalTrialOptions: Option[] = selectOptions['ClinicalTrial']
        .filter(({ value }) => 
            clinicalTrialOptionsToInclude.includes(value)
        )
    
    // Loop over each relevant clinical trial option and generate data for the bar chart
    let clinicalTrialData = filteredClinicalTrialOptions.flatMap(({ label, value }) => {
        // Filter grants to only those associated with the current clinical trial option
        const clinicalTrialGrants = grants.filter(grant => grant['ClinicalTrial'].includes(value))
        const researchAreaData: Record<string, ClinicalTrialsBarList> = {}

         // For each research area, process related grants and compute metrics
        researchAreaOptions.forEach(({ 
            label: researchAreaLabel, 
            value: researchAreaValue 
        }) => {
            // Filter grants for this research area and convert the grant amount to a number
            const researchAreaGrants = clinicalTrialGrants
                .filter(grant => 
                    grant['HundredDaysMissionResearchArea'].includes(researchAreaValue)
                ).map(grant => ({
                ...grant,
                GrantAmountConverted: Number(grant['GrantAmountConverted']),
            }))

            // Separate grants into those with known amounts vs unspecified amounts
            const grantsWithKnownAmounts = researchAreaGrants.filter(grant => grant['GrantAmountConverted'] > 0)
            const grantsWithUnspecifiedAmounts = researchAreaGrants.filter(grant => grant['GrantAmountConverted'] <= 0)

            // Sum the total committed amount for this research area
            const moneyCommitted = sumBy(researchAreaGrants, 'GrantAmountConverted')
            
            // Store the calculated metrics for this research area
            researchAreaData[researchAreaLabel] = {
                'Grants With Known Financial Commitments': grantsWithKnownAmounts.length,
                'Grants With Unspecified Financial Commitments': grantsWithUnspecifiedAmounts.length,
                'Total Grants':  researchAreaGrants.length,
                'Known Financial Commitments (USD)': moneyCommitted,
            }
        })

        return {
            phase: formatClinicalTrialsLabel(label),
            researchAreasByClinicalTrialPhase: researchAreaData,
            totalGrants: Object.values(researchAreaData).reduce((sum, obj) => sum + obj['Total Grants'], 0),
            totalAmountCommitted: Object.values(researchAreaData).reduce((sum, obj) => sum + obj['Known Financial Commitments (USD)'], 0)
        }
    })
    
    // Filter out any clinical trial phases that should be merged into "Unspecified"
    const unspecifiedData = clinicalTrialData.filter(({ phase }) =>
        keysToMerge.includes(phase)
    )

    if (unspecifiedData.length > 0) {
        // Initialize an object to accumulate research area metrics across the unspecified phases
        const mergedResearchAreas: Record<string, ClinicalTrialsBarList> = {}

        // Loop through each phase that needs to be merged
        unspecifiedData.forEach(({ researchAreasByClinicalTrialPhase }) => {
            // Loop through each research area in the current phase
            Object.entries(researchAreasByClinicalTrialPhase).forEach(([key, value]) => {
                if (!mergedResearchAreas[key]) {
                    // If this research area hasn't been added yet, copy the current values
                    mergedResearchAreas[key] = { ...value } 
                } else {
                    // Otherwise, sum the metrics into the existing entry
                    mergedResearchAreas[key]['Grants With Known Financial Commitments'] += value['Grants With Known Financial Commitments']
                    mergedResearchAreas[key]['Grants With Unspecified Financial Commitments'] += value['Grants With Unspecified Financial Commitments']
                    mergedResearchAreas[key]['Total Grants'] += value['Total Grants']
                    mergedResearchAreas[key]['Known Financial Commitments (USD)'] += value['Known Financial Commitments (USD)']
                }
            })
        })

        // Sum the total grants and total committed amounts across all research areas for "Unspecified"
        const totalGrants = Object.values(mergedResearchAreas).reduce(
            (sum, obj) => sum + obj['Total Grants'],
            0
        )

        const totalAmountCommitted = Object.values(mergedResearchAreas).reduce(
            (sum, obj) => sum + obj['Known Financial Commitments (USD)'],
            0
        )

        // Create a new object representing the "Unspecified" category
        const unspecified = {
            phase: "Unspecified",
            researchAreasByClinicalTrialPhase: mergedResearchAreas,
            totalGrants,
            totalAmountCommitted
        }

        // Add the "Unspecified" object to the clinical trial data
        clinicalTrialData.push(unspecified)
    }


    // Return the final data, excluding the original phases that were merged
    return clinicalTrialData.filter(clinicalTrial => !keysToMerge.includes(clinicalTrial['phase']))
}

const prepareHundredDaysClinicalTrialSubCategoryData = (grants: any[]) => {
    // Map over each research area to generate clinical trial data for that area        
    const clinicalTrialSubCategoryData = Object.fromEntries(researchAreaOptions.map(({ label: researchAreaLabel, value }) => {
        // Filter grants to only those that belong to the current research area
        const relatedGrants = grants
            .filter(grant => 
                grant['HundredDaysMissionResearchArea'].includes(value)
            )
        
        // Initialize an object to accumulate metrics for "Unspecified" trials
        let unspecifiedClinicalTrialsData: BarListDatum = {
            "Category Label": "Unspecified",
            "Category Value": "-99",
            "Grants With Known Financial Commitments": 0,
            "Grants With Unspecified Financial Commitments": 0,
            "Total Grants": 0,
            "Known Financial Commitments (USD)": 0,
        }
        
         // Prepare the clinical trial data for this research area
        // 1. Filter to include only the relevant clinical trial options
        // 2. Format the label
        // 3. Accumulate metrics for trials that should be merged into "Unspecified"
        const formattedClinicalTrialData = prepareBarChartData(relatedGrants, 'ClinicalTrial')
            .filter(clinicalTrial => 
                clinicalTrialOptionsToInclude.includes(clinicalTrial['Category Value']
            )).map(( clinicalTrial ) => {
                const formattedLabel = formatClinicalTrialsLabel(clinicalTrial['Category Label'])

                if (keysToMerge.includes(formattedLabel)) {
                    // Add metrics to the "Unspecified" object
                    unspecifiedClinicalTrialsData["Grants With Known Financial Commitments"] += clinicalTrial["Grants With Known Financial Commitments"]
                    unspecifiedClinicalTrialsData["Grants With Unspecified Financial Commitments"] += clinicalTrial["Grants With Unspecified Financial Commitments"]
                    unspecifiedClinicalTrialsData["Total Grants"] += clinicalTrial["Total Grants"]
                    unspecifiedClinicalTrialsData["Known Financial Commitments (USD)"] += clinicalTrial["Known Financial Commitments (USD)"]

                    // Return the original trial for now (will filter out later)
                    return clinicalTrial
                } else {
                    // Return the trial with the formatted label
                    return {
                        ...clinicalTrial,
                        "Category Label": formattedLabel
                    }
                }
            })

        // Remove the trials that were merged into "Unspecified"
        const clinicalTrialData = formattedClinicalTrialData.filter(
            (clinicalTrial) => !keysToMerge.includes(formatClinicalTrialsLabel(clinicalTrial["Category Label"]))
        )


        // Add the aggregated "Unspecified" trial as a single object
        clinicalTrialData.push(unspecifiedClinicalTrialsData)
        
        // Return an entry for Object.fromEntries: [researchAreaLabel, clinicalTrialData]
        return [
            researchAreaLabel, 
            clinicalTrialData
        ]
    }))
    
    // Re order the data based on the desired order specified by the client
    const orderedClinicalTrialData = Object.fromEntries(
        desiredResearchAreaOrder.map(key => [key, clinicalTrialSubCategoryData[key]])
    )

    return orderedClinicalTrialData
}

export {
    prepareHundredDaysClinicalTrialData,
    prepareHundredDaysClinicalTrialSubCategoryData
}