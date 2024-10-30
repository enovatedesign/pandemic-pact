import { createContext } from 'react'
import { Colours, coloursByField } from './colours'
import { sumNumericGrantAmounts } from './reducers'
import { sumBy } from 'lodash'

export interface BarListDatum {
    'Known Financial Commitments (USD)': number
    'Grants With Known Financial Commitments': number
    'Grants With Unspecified Financial Commitments': number
    'Total Grants': number
    'Category Label': string
    'Category Value': string
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
    const brightColours =
        coloursByField[field as keyof typeof coloursByField].bright

    const dimColours = coloursByField[field as keyof typeof coloursByField].dim

    return { brightColours, dimColours }
}

export function prepareBarListDataForCategory(
    grants: any[],
    category: { value: string; label: string },
    field: string
) {
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
        'Category Label': category.label,
        'Grants With Known Financial Commitments':
            grantsWithKnownAmounts.length,
        'Grants With Unspecified Financial Commitments':
            grantsWithUnspecifiedAmounts.length,
        'Total Grants':
            grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
        'Known Financial Commitments (USD)': moneyCommitted,
    }
}


export interface PhaseData {
    value: string
    label: string
    parent?: string
}

export function formatPhasesToPrepareForCategories(
    grants: any[],
    phases: { value: string; label: string }[],
    field: string
) {
    const phaseMap: { [key: string]: PhaseData[] } = {}
    
    // Create a new phase key to be used as the label for the accumulated phases
    // Push each phase to the corresponding key
    phases.forEach(phase => {
        let phaseKey
    
        if (/phase 0 clinical trial/i.test(phase.label) || /protocol/i.test(phase.label)) {
            phaseKey = 'Phase 0'
        } else if (/phase 1 clinical trial/i.test(phase.label) || /clinical trial, phase I\b/i.test(phase.label)) {
            phaseKey = 'Phase 1'
        } else if (/phase 2 clinical trial/i.test(phase.label) || /clinical trial, phase II\b/i.test(phase.label)) {
            phaseKey = 'Phase 2'
        } else if (/phase 3 clinical trial/i.test(phase.label) || /clinical trial, phase Iiii\b/i.test(phase.label)) {
            phaseKey = 'Phase 3'
        } else if (/phase 4 clinical trial/i.test(phase.label) || /clinical trial, phase iv\b/i.test(phase.label)) {
            phaseKey = 'Phase 4'
        } else if (
            /clinical Trial, veterinary/i.test(phase.label) || 
            /controlled clinical trial\b/i.test(phase.label) ||
            /randomised clinical trial/i.test(phase.label) ||
            /randomised clinical trial, veterinary/i.test(phase.label) ||
            /unspecified/i.test(phase.label)) { 
                phaseKey = 'Clinical trial (unspecified trial phase)'
        }
        
        if (phaseKey) {
            if (phaseMap[phaseKey as keyof typeof phaseMap]) {
                phaseMap[phaseKey as keyof typeof phaseMap].push(phase)
            } else {
                phaseMap[phaseKey as keyof typeof phaseMap] = [phase]
            }
        }
    })
    
    // For each individual phase, calculate the correct values
    const calculateIndividualPhases = Object.entries(phaseMap).map(([key, phases]) => {
        const valuesMap = phases.map(phase => {
            const uniqueGrantsRelatedToPhase = grants
                .filter((grant: any) => grant[field].includes(phase.value))

            const grantsWithKnownAmounts = uniqueGrantsRelatedToPhase
                .filter((grant: any) => typeof grant.GrantAmountConverted === 'number')
            
            const grantsWithUnspecifiedAmounts = uniqueGrantsRelatedToPhase
                .filter((grant: any) => typeof grant.GrantAmountConverted !== 'number')
            
            const moneyCommitted = grantsWithKnownAmounts.reduce(
                ...sumNumericGrantAmounts
            )
            // Check to see if a grant is included twice
            // If a grant is tagged with unspecified and a phase, include only in the phase and remove from unspecified
            return {
                'Category Value': phase.value,
                'Category Label': key,  
                'Grants With Known Financial Commitments': grantsWithKnownAmounts.length,
                'Grants With Unspecified Financial Commitments': grantsWithUnspecifiedAmounts.length,
                'Total Grants': grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
                'Known Financial Commitments (USD)': moneyCommitted,
            }
        })
        return {
            [key]: valuesMap
        }
    })

    // Combine the total individual values for each phase
    const formattedPhaseData = calculateIndividualPhases
        .flatMap(phase => Object.entries(phase)
        .map(([key, values]) => {
            return {
                'Category Value': key,
                'Category Label': key,
                'Grants With Known Financial Commitments': sumBy(values, 'Grants With Known Financial Commitments'),
                'Grants With Unspecified Financial Commitments': sumBy(values, 'Grants With Unspecified Financial Commitments'),
                'Total Grants': sumBy(values, 'Total Grants'),
                'Known Financial Commitments (USD)': sumBy(values, 'Known Financial Commitments (USD)')
            }
        }
    ))
    
    return formattedPhaseData
}