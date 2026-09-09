import { BarListDatum } from '@/app/helpers/bar-list'
import {
    clinicalTrialPhaseLabels,
    diagnosticsStageLabels,
    isDiagnosticsD1Grant,
    matchesDiagnosticsStage,
    trialPhaseLabels,
    type DevelopmentStageKey,
} from '@/app/helpers/clinical-trial-phases'
import selectOptions from '@/data/dist/select-options.json'
import { sumBy } from 'lodash'

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

const DIAGNOSTICS_RESEARCH_AREA = 'Diagnostics'

/**
 * The rows of both views, and how each intervention reaches them.
 *
 * Diagnostics awards carry no clinical trial phase, so they are placed by D1
 * development stage instead; every other research area is placed by its
 * ClinicalTrial codes. Codes 7 and 8 share the Unspecified row.
 *
 * `key` rather than a label because the two views word a row differently: the
 * collapsed view stacks all four research areas into one row and has to name
 * both, while the expanded view splits them and can use each area's own wording.
 *
 * `categoryValue` is what the expanded view colours and sorts on, so the
 * diagnostics rows reuse the equivalent ClinicalTrial codes and inherit the same
 * colour ramp as the other three sections.
 */
const phaseRows: {
    key: DevelopmentStageKey
    categoryValue: string
    clinicalTrialCodes: string[]
    diagnosticsCodes: string[]
}[] = [
    { key: 'phase1', categoryValue: '2', clinicalTrialCodes: ['2'], diagnosticsCodes: ['a'] },
    { key: 'phase2', categoryValue: '3', clinicalTrialCodes: ['3'], diagnosticsCodes: ['b'] },
    { key: 'phase3', categoryValue: '4', clinicalTrialCodes: ['4'], diagnosticsCodes: ['c'] },
    { key: 'phase4', categoryValue: '5', clinicalTrialCodes: ['5'], diagnosticsCodes: ['d'] },
    {
        key: 'unspecified',
        categoryValue: '-99',
        clinicalTrialCodes: ['7', '8'],
        diagnosticsCodes: ['e', '-99'],
    },
]

const emptyMetrics = (): ClinicalTrialsBarList => ({
    'Grants With Known Financial Commitments': 0,
    'Grants With Unspecified Financial Commitments': 0,
    'Total Grants': 0,
    'Known Financial Commitments (USD)': 0,
})

/** GrantAmountConverted arrives here as a string, so coerce before comparing. */
const summarise = (grants: any[]): ClinicalTrialsBarList => {
    const withAmounts = grants.map(grant => ({
        ...grant,
        GrantAmountConverted: Number(grant['GrantAmountConverted']),
    }))

    return {
        'Grants With Known Financial Commitments': withAmounts.filter(grant => grant['GrantAmountConverted'] > 0).length,
        'Grants With Unspecified Financial Commitments': withAmounts.filter(grant => grant['GrantAmountConverted'] <= 0).length,
        'Total Grants': withAmounts.length,
        'Known Financial Commitments (USD)': sumBy(withAmounts, 'GrantAmountConverted'),
    }
}

const addMetrics = (a: ClinicalTrialsBarList, b: ClinicalTrialsBarList): ClinicalTrialsBarList => ({
    'Grants With Known Financial Commitments': a['Grants With Known Financial Commitments'] + b['Grants With Known Financial Commitments'],
    'Grants With Unspecified Financial Commitments': a['Grants With Unspecified Financial Commitments'] + b['Grants With Unspecified Financial Commitments'],
    'Total Grants': a['Total Grants'] + b['Total Grants'],
    'Known Financial Commitments (USD)': a['Known Financial Commitments (USD)'] + b['Known Financial Commitments (USD)'],
})

/** The diagnostics awards on one row, independent of research-area tagging. */
const diagnosticsGrantsForRow = (grants: any[], diagnosticsCodes: string[]) =>
    grants.filter(grant =>
        isDiagnosticsD1Grant(grant) && matchesDiagnosticsStage(grant, diagnosticsCodes),
    )

/**
 * One row's metrics for one research area.
 *
 * The non-diagnostics branch sums its codes separately rather than intersecting
 * them, so a grant tagged both 7 and 8 keeps being counted twice on the
 * Unspecified row exactly as it was before.
 */
const metricsForRow = (
    grants: any[],
    researchAreaLabel: string,
    researchAreaValue: string,
    row: (typeof phaseRows)[number],
): ClinicalTrialsBarList => {
    if (researchAreaLabel === DIAGNOSTICS_RESEARCH_AREA) {
        return summarise(diagnosticsGrantsForRow(grants, row.diagnosticsCodes))
    }

    return row.clinicalTrialCodes
        .map(code =>
            summarise(
                grants.filter(grant =>
                    grant['ClinicalTrial'].includes(code) &&
                    grant['HundredDaysMissionResearchArea'].includes(researchAreaValue),
                ),
            ),
        )
        .reduce(addMetrics, emptyMetrics())
}

/**
 * Research areas to render, keyed off the desired order rather than the select
 * options: the diagnostics rows no longer depend on research-area tagging, so
 * that column must survive code '1' dropping out of the filtered subset.
 *
 * Diagnostics is the only area that can be resolved without a code. Any other
 * area whose option is missing is dropped rather than rendered as a column of
 * zeros, which would read as "no funding" instead of "no data".
 */
const researchAreasToRender = (): { label: string; value: string }[] =>
    desiredResearchAreaOrder.flatMap(label => {
        const value = researchAreaOptions.find(option => option.label === label)?.value

        if (value === undefined) {
            return label === DIAGNOSTICS_RESEARCH_AREA ? [{ label, value: '' }] : []
        }

        return [{ label, value }]
    })

const prepareHundredDaysClinicalTrialData = (grants: any[]) =>
    phaseRows.map(row => {
        const researchAreaData: Record<string, ClinicalTrialsBarList> = {}

        researchAreasToRender().forEach(({ label, value }) => {
            researchAreaData[label] = metricsForRow(grants, label, value, row)
        })

        return {
            phase: clinicalTrialPhaseLabels[row.key],
            researchAreasByClinicalTrialPhase: researchAreaData,
            totalGrants: sumBy(Object.values(researchAreaData), 'Total Grants'),
            totalAmountCommitted: sumBy(Object.values(researchAreaData), 'Known Financial Commitments (USD)'),
        }
    })

const prepareHundredDaysClinicalTrialSubCategoryData = (grants: any[]) =>
    Object.fromEntries(
        researchAreasToRender().map(({ label, value }): [string, BarListDatum[]] => {
            const rows = phaseRows.map(row => ({
                'Category Label': label === DIAGNOSTICS_RESEARCH_AREA
                    ? diagnosticsStageLabels[row.key]
                    : trialPhaseLabels[row.key],
                'Category Value': row.categoryValue,
                ...metricsForRow(grants, label, value, row),
            }))

            return [label, rows]
        }),
    )

export {
    prepareHundredDaysClinicalTrialData,
    prepareHundredDaysClinicalTrialSubCategoryData
}
