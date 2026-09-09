/**
 * The development-stage axis shared by the funding-tracking clinical research
 * chart and the 100 Days Mission clinical trials chart.
 *
 * Three wordings exist for the same five or six rows. Where trial-phase and
 * development-stage grants stack into one row — the collapsed funding-tracking
 * chart, both 100 Days Mission views — the row has to name both, so it uses
 * `clinicalTrialPhaseLabels`. Where a section is all one or the other, it uses
 * that section's own wording. Always reference these constants rather than
 * retyping the strings; a label that differs by so much as a space becomes a
 * phantom extra row.
 */
export const clinicalTrialPhaseLabels = {
    preClinical: 'Pre-clinical studies',
    phase1: 'Phase 1 / Early Stage',
    phase2: 'Phase 2 / Intermediate Phase',
    phase3: 'Phase 3 / Late Stage',
    phase4: 'Phase 4 / Post-Market',
    unspecified: 'Unspecified phase / Stage',
} as const

/** Expanded-view wording for the three sections placed by clinical trial phase. */
export const trialPhaseLabels = {
    preClinical: 'Pre-clinical studies',
    phase1: 'Phase 1',
    phase2: 'Phase 2',
    phase3: 'Phase 3',
    phase4: 'Phase 4',
    unspecified: 'Unspecified phase',
} as const

/** Expanded-view wording for the Diagnostics section, which has no pre-clinical row. */
export const diagnosticsStageLabels = {
    phase1: 'Early Stage',
    phase2: 'Intermediate Phase',
    phase3: 'Late Stage',
    phase4: 'Post-Market',
    unspecified: 'Unspecified Stage',
} as const

/** The five rows shared by both wordings; pre-clinical is trial-phase only. */
export type DevelopmentStageKey = keyof typeof diagnosticsStageLabels

/**
 * A rendered row label mapped back to its row on the shared axis.
 *
 * The collapsed chart is a pivot of the expanded rows and the phase colours are
 * keyed by axis label, so both need a way back from whichever wording rendered
 * the row. Labels from outside this axis pass through untouched.
 */
const sharedAxisLabelByRowLabel: Record<string, string> = {
    [trialPhaseLabels.preClinical]: clinicalTrialPhaseLabels.preClinical,
    [trialPhaseLabels.phase1]: clinicalTrialPhaseLabels.phase1,
    [trialPhaseLabels.phase2]: clinicalTrialPhaseLabels.phase2,
    [trialPhaseLabels.phase3]: clinicalTrialPhaseLabels.phase3,
    [trialPhaseLabels.phase4]: clinicalTrialPhaseLabels.phase4,
    [trialPhaseLabels.unspecified]: clinicalTrialPhaseLabels.unspecified,
    [diagnosticsStageLabels.phase1]: clinicalTrialPhaseLabels.phase1,
    [diagnosticsStageLabels.phase2]: clinicalTrialPhaseLabels.phase2,
    [diagnosticsStageLabels.phase3]: clinicalTrialPhaseLabels.phase3,
    [diagnosticsStageLabels.phase4]: clinicalTrialPhaseLabels.phase4,
    [diagnosticsStageLabels.unspecified]: clinicalTrialPhaseLabels.unspecified,
}

export const sharedAxisLabel = (rowLabel: string): string =>
    sharedAxisLabelByRowLabel[rowLabel] ?? rowLabel

/** Row order for a section with no pre-clinical stage — everything but Therapeutics/Vaccines. */
export const trialPhaseOrder: string[] = [
    trialPhaseLabels.phase1,
    trialPhaseLabels.phase2,
    trialPhaseLabels.phase3,
    trialPhaseLabels.phase4,
    trialPhaseLabels.unspecified,
]

/** Row order for the Diagnostics section. */
export const diagnosticsStageOrder: string[] = [
    diagnosticsStageLabels.phase1,
    diagnosticsStageLabels.phase2,
    diagnosticsStageLabels.phase3,
    diagnosticsStageLabels.phase4,
    diagnosticsStageLabels.unspecified,
]

/** The one `diagnostics_theme_category` code that describes R&D stages. */
export const diagnosticsThemeCode = 'D1'

/**
 * D1 sub-codes to their place on the axis above. Codes 'f' (manufacturing and
 * supply chain), 'g' (infrastructure) and '-88' (other) are deliberately absent:
 * they are D1 activities rather than development stages, so they have nowhere to
 * sit. '-99' is the dictionary's own "Unspecified" and 'e' the stage-specific
 * "Unspecified stage" — the same thing here.
 *
 * `categoryValue` reuses the equivalent ClinicalTrial codes so the 100 Days
 * Mission rows, which colour and sort on Category Value, need no special casing.
 *
 * The clinical-trials (ICTRP) dataset draws the same distinction in
 * app/clinical-trials/visualise/visualisations/PhaseDevelopmentStage.tsx, but
 * against its own axis labels — the two are deliberately not shared.
 */
export const diagnosticsStageBuckets: {
    label: string
    categoryValue: string
    codes: string[]
}[] = [
    { label: diagnosticsStageLabels.phase1, categoryValue: '2', codes: ['a'] },
    { label: diagnosticsStageLabels.phase2, categoryValue: '3', codes: ['b'] },
    { label: diagnosticsStageLabels.phase3, categoryValue: '4', codes: ['c'] },
    { label: diagnosticsStageLabels.phase4, categoryValue: '5', codes: ['d'] },
    {
        label: diagnosticsStageLabels.unspecified,
        categoryValue: '-99',
        codes: ['e', '-99'],
    },
]

/** A diagnostics-categorised grant whose theme includes the R&D-stage theme. */
export const isDiagnosticsD1Grant = (grant: any): boolean =>
    grant?.DiagnosticsCategorisation === '1' &&
    (grant?.DiagnosticsThemeCategory ?? []).includes(diagnosticsThemeCode)

/**
 * Whether a gated grant belongs on a bucket's row. A grant ticking several
 * stages appears on several rows, matching how a multi-phase grant is already
 * counted against each of its phases.
 */
export const matchesDiagnosticsStage = (grant: any, codes: string[]): boolean =>
    (grant?.DiagnosticsD1Sub ?? []).some((code: string) => codes.includes(code))
