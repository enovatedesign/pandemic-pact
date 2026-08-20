'use client'

import { ElementType, useContext, useMemo } from 'react'
import { BeakerIcon, ClipboardListIcon, SearchIcon } from '@heroicons/react/solid'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts'

import VisualisationCard from '../../../components/VisualisationCard'
import {
    clinicalTrialsFullDataFilename,
    clinicalTrialsFilteredDataFilename,
} from '../../../helpers/export'
import TooltipContent from '../../../components/TooltipContent'
import NoDataText from '../../../components/NoData/NoDataText'
import { GlobalFilterContext } from '../../../helpers/filters'
import { brandColours } from '../../../helpers/colours'
import { rechartBaseTooltipProps } from '../../../helpers/tooltip'
import { useSelectOptions } from './useSelectOptions'

/**
 * Visualisation 3 — Distribution of clinical research registrations by Clinical
 * Trial Phase / Development Stage, across the three intervention pathways
 * (the pathway is the view toggle). Mappings follow the authoritative CT data
 * dictionary (which corrected the Technical Spec's 7/8 swap).
 */

type Pathway = 'vaccines' | 'therapeutics' | 'diagnostics'

const PATHWAY_INTERVENTION_CODE: Record<Pathway, string> = {
    vaccines: '1',
    therapeutics: '2',
    diagnostics: '4',
}

const PHASE_BUCKETS: { label: string; codes: string[] }[] = [
    { label: 'Phase I', codes: ['2'] },
    { label: 'Phase II', codes: ['3'] },
    { label: 'Phase III', codes: ['4'] },
    { label: 'Phase IV', codes: ['5'] },
    { label: 'Unspecified', codes: ['7', '8', '99'] },
]

// D1 sub-category codes are case-sensitive matches against the resolved
// dictionary values, which are upper-case for the theme and lower-case for the
// sub-category. Codes 'f'/'g' (manufacturing, infrastructure) are deliberately
// absent: they are D1 activities, not development stages, so they have no
// position on this axis.
const DIAGNOSTIC_THEME_CODE = 'D1'

const DIAGNOSTIC_STAGES: { label: string; codes: string[] }[] = [
    { label: 'Early Stage', codes: ['a'] },
    { label: 'Intermediate', codes: ['b'] },
    { label: 'Late Stage', codes: ['c'] },
    { label: 'Post-Market', codes: ['d'] },
    // '-99' is the dictionary's own "Unspecified"; 'e' is the stage-specific
    // "Unspecified stage". Both mean the same thing here.
    { label: 'Unspecified stage', codes: ['e', '-99'] },
]

// Recruitment status -> brand colour, using the same brand sequence as the other
// categorical visualisations. The sentinel status (Unspecified) gets a distinct
// colour so it doesn't read as the same bar.
//
// The codes mirror the CT data dictionary's `recruitment_status` choices. The
// former Pending ('1'), Other ('-88') and Not applicable ('-9999') statuses were
// retired by the data owners and are now all coded as Unspecified ('-99').
const RECRUITMENT_COLOURS: Record<string, string> = {
    '2': brandColours.teal['500'], // Recruiting
    '3': brandColours.green['500'], // Suspended
    '4': brandColours.orange['500'], // Complete
    '5': brandColours.grey['400'], // Terminated
    '-99': brandColours.yellow['600'], // Unspecified
}
const FALLBACK_COLOUR = brandColours.grey['600']

// Shape-only fallback rendered (blurred) behind the "no data" message.
const FALLBACK_VALUES = [4, 7, 5, 6, 3, 4]

const bucketsFor = (pathway: Pathway) =>
    pathway === 'diagnostics' ? DIAGNOSTIC_STAGES : PHASE_BUCKETS

/** Whether a trial belongs in one of a bucket's x-axis categories. */
function matchesBucket(trial: any, pathway: Pathway, codes: string[]) {
    if (pathway === 'diagnostics') {
        if (trial.DiagnosticsCategorisation !== '1') return false
        if (
            !(trial.DiagnosticsThemeCategory ?? []).includes(DIAGNOSTIC_THEME_CODE)
        ) {
            return false
        }
        return (trial.DiagnosticsD1Sub ?? []).some((s: string) =>
            codes.includes(s),
        )
    }
    return (trial.Phase ?? []).some((p: string) => codes.includes(p))
}

/**
 * The trials a pathway's chart actually plots — in the intervention *and* landing
 * in one of its buckets. Narrower than "tagged with this intervention": a trial
 * whose phase/stage has no place on the axis (e.g. Phase "Not applicable") is
 * drawn nowhere, so the per-tab CSV must exclude it too or the download won't
 * reconcile with the bars.
 */
export function plottedTrials(trials: any[], pathway: Pathway) {
    const interventionCode = PATHWAY_INTERVENTION_CODE[pathway]

    return trials.filter(
        (trial: any) =>
            (trial.Interventions ?? []).includes(interventionCode) &&
            bucketsFor(pathway).some(bucket =>
                matchesBucket(trial, pathway, bucket.codes),
            ),
    )
}

function PathwayChart({ pathway }: { pathway: Pathway }) {
    const { grants: trials } = useContext(GlobalFilterContext)
    const recruitmentLabels = useSelectOptions('RecruitmentStatus')

    const buckets = bucketsFor(pathway)

    // The x-axis categories differ by pathway: clinical trial phases for the
    // vaccine/therapeutic pathways, development stages for diagnostics.
    const xAxisLabel =
        pathway === 'diagnostics' ? 'Development Stage' : 'Clinical Trial Phase'

    const { data, statusCodes } = useMemo(() => {
        const interventionCode = PATHWAY_INTERVENTION_CODE[pathway]
        const inPathway = trials.filter((t: any) =>
            (t.Interventions ?? []).includes(interventionCode),
        )
        const statusSet = new Set<string>()

        const rows = buckets.map(bucket => {
            const row: Record<string, any> = { stage: bucket.label }
            inPathway.forEach((trial: any) => {
                if (!matchesBucket(trial, pathway, bucket.codes)) return
                // A blank status falls into Unspecified rather than rendering as
                // its own unlabelled segment.
                const status = trial.RecruitmentStatus || '-99'
                statusSet.add(status)
                row[status] = (row[status] ?? 0) + 1
            })
            return row
        })

        return { data: rows, statusCodes: Array.from(statusSet).sort() }
    }, [trials, pathway, buckets])

    const noData = statusCodes.length === 0

    const fallbackData = buckets.map((bucket, i) => ({
        stage: bucket.label,
        fallback: FALLBACK_VALUES[i % FALLBACK_VALUES.length],
    }))

    const tooltipContent = (props: any) => {
        if (!props.active || !props.payload?.length) return null

        const items = props.payload
            .filter((p: any) => p.value)
            .map((p: any) => ({ label: p.name, value: p.value, colour: p.color }))

        return (
            <TooltipContent
                title={props.label}
                subtitle="Recruitment Status"
                items={items}
            />
        )
    }

    return (
        // `relative` confines NoDataText's `absolute inset-0` overlay to the
        // chart. Without it the overlay resolves against the card wrapper and
        // covers the tab controls, making the pathway impossible to switch away
        // from once an empty one is selected.
        <div className="w-full relative">
            <div className={['w-full', noData && 'blur-md'].filter(Boolean).join(' ')}>
                <div style={{ width: '100%', height: 420 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={noData ? fallbackData : data}
                            margin={{ top: 8, right: 16, bottom: 8, left: 24 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="stage"
                                tick={{ fontSize: 12 }}
                                height={48}
                                label={{
                                    value: xAxisLabel,
                                    position: 'insideBottom',
                                    offset: 0,
                                    style: { textAnchor: 'middle' },
                                }}
                            />
                            <YAxis
                                allowDecimals={false}
                                label={{
                                    value: 'Number of clinical trials',
                                    position: 'left',
                                    angle: -90,
                                    style: { textAnchor: 'middle' },
                                    offset: 10,
                                }}
                            />
                            {!noData && (
                                <Tooltip
                                    content={tooltipContent}
                                    cursor={{ fill: 'transparent' }}
                                    {...rechartBaseTooltipProps}
                                />
                            )}
                            {!noData && (
                                <Legend wrapperStyle={{ paddingTop: 16 }} />
                            )}

                            {noData ? (
                                <Bar dataKey="fallback" fill={brandColours.grey['400']} />
                            ) : (
                                statusCodes.map(code => (
                                    <Bar
                                        key={code}
                                        dataKey={code}
                                        stackId="recruitment"
                                        name={recruitmentLabels[code] ?? code}
                                        fill={RECRUITMENT_COLOURS[code] ?? FALLBACK_COLOUR}
                                    />
                                ))
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {noData && <NoDataText />}
        </div>
    )
}

const PATHWAY_TABS: { pathway: Pathway; icon: ElementType; label: string }[] = [
    { pathway: 'vaccines', icon: BeakerIcon, label: 'Vaccines' },
    { pathway: 'therapeutics', icon: ClipboardListIcon, label: 'Therapeutics' },
    { pathway: 'diagnostics', icon: SearchIcon, label: 'Diagnostics' },
]

export default function PhaseDevelopmentStage() {
    const { grants: trials } = useContext(GlobalFilterContext)

    const tabs = useMemo(
        () =>
            PATHWAY_TABS.map(({ pathway, icon, label }) => ({
                tab: { icon, label },
                content: <PathwayChart pathway={pathway} />,
                subsetExport: {
                    label: `Export ${label} Data (CSV)`,
                    ids: plottedTrials(trials, pathway).map(
                        (trial: any) => trial.TrialID,
                    ),
                    filename: `pandemic-pact-${pathway}-clinical-trials.csv`,
                },
            })),
        [trials],
    )

    return (
        <VisualisationCard
            id="ct-phase-development-stage"
            dataset="clinical-trials"
            filenameToFetch={clinicalTrialsFullDataFilename}
            filteredFileName={clinicalTrialsFilteredDataFilename}
            title="Distribution of clinical research registrations by Clinical Trial Phase / Development Stage and Recruitment Status"
            subtitle="The chart shows the number of clinical research registrations across all diseases categorised by trial intervention and recruitment status."
            footnote="Please note: some clinical research may fall under multiple categories; these overlaps are not explicitly shown."
            tabPrefixLabel="Intervention:"
            tabs={tabs}
        />
    )
}
