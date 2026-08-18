'use client'

import { useContext, useEffect, useMemo, useState } from 'react'
import { ClockIcon, ChartBarIcon } from '@heroicons/react/solid'
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts'

import VisualisationCard from '../../../components/VisualisationCard'
import {
    clinicalTrialsFullDataFilename,
    clinicalTrialsFilteredDataFilename,
} from '../../../helpers/export'
import ImageExportLegend from '../../../components/ImageExportLegend'
import Legend from '../../../components/Legend'
import RechartTrendsTooltipContent from '../../../components/RechartTrendsTooltipContent'
import TooltipContent, { TooltipContentItem } from '../../../components/TooltipContent'
import NoDataText from '../../../components/NoData/NoDataText'
import { GlobalFilterContext } from '../../../helpers/filters'
import { diseaseColours, brandColours } from '../../../helpers/colours'
import { rechartBaseTooltipProps } from '../../../helpers/tooltip'
import { useSelectOptions } from './useSelectOptions'

/**
 * Visualisation 2 — Global annual number of clinical research registrations for
 * studies on diseases with a pandemic potential (Technical Spec Viz 2).
 *
 * Mirrors the grants reference (GrantsByDisease) responsive approach:
 *  - Desktop (>= 768px): every disease as a line, tooltip on, no on-screen key
 *    (a hidden ImageExportLegend is included for PNG exports).
 *  - Mobile (< 768px): the top diseases only, tooltip off, with an on-screen key
 *    underneath.
 * Bars view: registrations per year, stacked by disease — the annual reading the
 * card's title promises, as a bar chart.
 */

const MOBILE_LINE_LIMIT = 12
const OTHER_COLOUR = brandColours.grey['400']

// A stacked year can carry 25+ diseases; cap the tooltip so it can't run off screen.
const STACKED_TOOLTIP_LIMIT = 10
const OTHER_DISEASES_LABEL = 'Other diseases'
// Deliberately not OTHER_COLOUR: diseaseColours already spends grey-200 to grey-700
// on real diseases (Yellow Fever is grey-400), so the grouped segment needs a shade
// no disease uses or it reads as one of them in the key.
const OTHER_DISEASES_COLOUR = brandColours.grey['800']

// Record codes are canonicalised against the data dictionary at generate time
// (scripts/helpers/redcap-codes.ts), so they key straight into the shared map.
function getDiseaseColour(code: string): string {
    return diseaseColours[code] ?? OTHER_COLOUR
}

const isAggregateLabel = (label: string) => label === 'Other' || label === 'Unspecified'

// Shape-only fallback rendered (blurred) behind the "no data" message.
const FALLBACK_TREND = [
    { year: '2019', Example: 4 },
    { year: '2020', Example: 7 },
    { year: '2021', Example: 5 },
    { year: '2022', Example: 9 },
    { year: '2023', Example: 6 },
]
const FALLBACK_STACKED_SERIES = [
    { label: 'Example A', colour: brandColours.grey['300'] },
    { label: 'Example B', colour: brandColours.grey['400'] },
    { label: 'Example C', colour: brandColours.grey['500'] },
]
const FALLBACK_STACKED = [
    { year: '2019', 'Example A': 4, 'Example B': 3, 'Example C': 2 },
    { year: '2020', 'Example A': 7, 'Example B': 2, 'Example C': 4 },
    { year: '2021', 'Example A': 5, 'Example B': 5, 'Example C': 1 },
    { year: '2022', 'Example A': 9, 'Example B': 3, 'Example C': 3 },
    { year: '2023', 'Example A': 6, 'Example B': 6, 'Example C': 2 },
]

export default function AnnualRegistrationsByDisease() {
    const { grants: trials } = useContext(GlobalFilterContext)
    const diseaseLabels = useSelectOptions('Diseases')

    // Track whether we're on a medium-or-larger viewport (matches the reference).
    const [isMediumUp, setIsMediumUp] = useState(true)
    useEffect(() => {
        const mql = window.matchMedia('(min-width: 768px)')
        const update = () => setIsMediumUp(mql.matches)
        update()
        mql.addEventListener('change', update)
        return () => mql.removeEventListener('change', update)
    }, [])

    const labelFor = (code: string) => diseaseLabels[code] ?? code

    // Lock the whole visualisation (both tabs) to 2020 onwards, mirroring the
    // grants dataset, so switching between Temporal and Bars doesn't drift.
    const trialsInRange = useMemo(
        () =>
            trials.filter(
                (t: any) =>
                    /^\d{4}$/.test(t.RegistrationYear ?? '') &&
                    Number(t.RegistrationYear) >= 2020,
            ),
        [trials],
    )

    // Diseases present in the (date-locked) data, excluding Other/Unspecified,
    // ranked by total registrations (descending).
    const diseasesWithData = useMemo(() => {
        const totals = new Map<string, number>()
        trialsInRange.forEach((trial: any) => {
            ;(trial.Diseases ?? []).forEach((code: string) => {
                totals.set(code, (totals.get(code) ?? 0) + 1)
            })
        })
        return Array.from(totals.entries())
            .map(([code, total]) => ({ code, label: labelFor(code), total, colour: getDiseaseColour(code) }))
            .filter(d => d.total > 0 && !isAggregateLabel(d.label))
            .sort((a, b) => b.total - a.total)
    }, [trialsInRange, diseaseLabels]) // eslint-disable-line react-hooks/exhaustive-deps

    const noData = diseasesWithData.length === 0

    // Lines: all diseases on desktop, the top N on mobile.
    const linesToRender = isMediumUp
        ? diseasesWithData
        : diseasesWithData.slice(0, MOBILE_LINE_LIMIT)

    // Trend rows: one per year, a key per disease label.
    const trendData = useMemo(() => {
        const byYear = new Map<string, Record<string, number>>()
        trialsInRange.forEach((trial: any) => {
            const year = trial.RegistrationYear
            if (!byYear.has(year)) byYear.set(year, {})
            const row = byYear.get(year)!
            ;(trial.Diseases ?? []).forEach((code: string) => {
                const label = labelFor(code)
                if (isAggregateLabel(label)) return
                row[label] = (row[label] ?? 0) + 1
            })
        })
        return Array.from(byYear.entries())
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([year, counts]) => ({ year, ...counts }))
    }, [trialsInRange, diseaseLabels]) // eslint-disable-line react-hooks/exhaustive-deps

    // Stacked series: every disease on desktop. On mobile the lines view simply drops
    // the tail (a line each is independent), but dropping segments would shorten the
    // bars, so the tail is grouped into one "Other diseases" segment instead.
    const stackedSeries = useMemo(() => {
        const asSeries = (d: (typeof diseasesWithData)[number]) => ({
            label: d.label,
            colour: d.colour,
            codes: [d.code],
        })

        if (isMediumUp || diseasesWithData.length <= MOBILE_LINE_LIMIT) {
            return diseasesWithData.map(asSeries)
        }

        const tail = diseasesWithData.slice(MOBILE_LINE_LIMIT)

        return [
            ...diseasesWithData.slice(0, MOBILE_LINE_LIMIT).map(asSeries),
            {
                label: OTHER_DISEASES_LABEL,
                colour: OTHER_DISEASES_COLOUR,
                codes: tail.map(d => d.code),
            },
        ]
    }, [diseasesWithData, isMediumUp])

    // Stacked rows: one per year, a key per series. Unlike trendData (which omits
    // zero keys, fine for lines), every series is seeded at zero — recharts gaps a
    // stack when a key is absent from a row.
    const stackedData = useMemo(() => {
        const seriesByCode = new Map<string, string>()
        stackedSeries.forEach(series => {
            series.codes.forEach(code => seriesByCode.set(code, series.label))
        })

        const byYear = new Map<string, Record<string, number>>()

        trialsInRange.forEach((trial: any) => {
            const year = trial.RegistrationYear
            if (!byYear.has(year)) {
                byYear.set(
                    year,
                    Object.fromEntries(stackedSeries.map(series => [series.label, 0])),
                )
            }
            const row = byYear.get(year)!
            ;(trial.Diseases ?? []).forEach((code: string) => {
                // Codes with no series are the Other/Unspecified aggregates already
                // excluded from diseasesWithData.
                const label = seriesByCode.get(code)
                if (label) row[label] += 1
            })
        })

        return Array.from(byYear.entries())
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([year, counts]) => ({ year, ...counts }))
    }, [trialsInRange, stackedSeries])

    const temporalContent = (
        <div className="w-full relative">
            <div className={['w-full', noData && 'blur-md'].filter(Boolean).join(' ')}>
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart
                        data={noData ? FALLBACK_TREND : trendData}
                        margin={{ top: 5, right: 30, left: 30, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="year"
                            type="category"
                            label={{ value: 'Year', position: 'bottom', offset: 0 }}
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
                        {!noData && isMediumUp && (
                            <Tooltip
                                content={props => (
                                    <RechartTrendsTooltipContent props={props} chartData={trendData} />
                                )}
                                {...rechartBaseTooltipProps}
                            />
                        )}
                        {(noData
                            ? [{ label: 'Example', colour: OTHER_COLOUR }]
                            : linesToRender
                        ).map(d => (
                            <Line
                                key={d.label}
                                type="monotone"
                                dataKey={d.label}
                                stroke={d.colour}
                                strokeWidth={2}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>

                {/* Mobile: on-screen key for the top diseases shown. */}
                {!isMediumUp && !noData && (
                    <div className="mt-4 md:hidden">
                        <Legend
                            categories={linesToRender.map(d => d.label)}
                            colours={linesToRender.map(d => d.colour)}
                            customWrapperClasses="grid grid-cols-2 gap-x-2 gap-y-1"
                            customTextClasses="whitespace-normal"
                        />
                    </div>
                )}

                {/* Desktop: hidden legend, included only in PNG exports. */}
                {isMediumUp && (
                    <ImageExportLegend
                        categories={diseasesWithData.map(d => d.label)}
                        colours={diseasesWithData.map(d => d.colour)}
                    />
                )}
            </div>

            {noData && <NoDataText />}
        </div>
    )

    const stackedTooltip = (props: any) => {
        if (!props.active || !props.payload?.length) return null

        const segments = [...props.payload]
            .filter((p: any) => p.value)
            .sort((a: any, b: any) => b.value - a.value)

        if (!segments.length) return null

        const sum = (entries: any[]) =>
            entries.reduce((total: number, p: any) => total + p.value, 0)

        const items: TooltipContentItem[] = segments
            .slice(0, STACKED_TOOLTIP_LIMIT)
            .map((p: any) => ({
                label: p.name,
                value: p.value.toLocaleString(),
                colour: p.color,
            }))

        const remainder = segments.slice(STACKED_TOOLTIP_LIMIT)

        if (remainder.length) {
            items.push({
                label: `+${remainder.length} other diseases`,
                value: sum(remainder).toLocaleString(),
            })
        }

        // The bar height is the sum of its segments, not the number of records —
        // records can carry several diseases, or none. See the card's footnote.
        items.push({
            label: 'Total (all diseases)',
            value: sum(segments).toLocaleString(),
            bold: true,
        })

        return <TooltipContent title={props.label} subtitle="Disease" items={items} />
    }

    const stackedContent = (
        <div className="w-full relative">
            <div className={['w-full', noData && 'blur-md'].filter(Boolean).join(' ')}>
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                        data={noData ? FALLBACK_STACKED : stackedData}
                        margin={{ top: 5, right: 30, left: 30, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="year"
                            type="category"
                            label={{ value: 'Year', position: 'bottom', offset: 0 }}
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
                                content={stackedTooltip}
                                cursor={{ fill: 'transparent' }}
                                {...rechartBaseTooltipProps}
                            />
                        )}
                        {(noData ? FALLBACK_STACKED_SERIES : stackedSeries).map(series => (
                            <Bar
                                key={series.label}
                                dataKey={series.label}
                                name={series.label}
                                stackId="diseases"
                                fill={series.colour}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>

                {/* Mobile: on-screen key, including the grouped "Other diseases" segment. */}
                {!isMediumUp && !noData && (
                    <div className="mt-4 md:hidden">
                        <Legend
                            categories={stackedSeries.map(series => series.label)}
                            colours={stackedSeries.map(series => series.colour)}
                            customWrapperClasses="grid grid-cols-2 gap-x-2 gap-y-1"
                            customTextClasses="whitespace-normal"
                        />
                    </div>
                )}

                {/* Desktop: hidden legend, included only in PNG exports. */}
                {isMediumUp && (
                    <ImageExportLegend
                        categories={diseasesWithData.map(d => d.label)}
                        colours={diseasesWithData.map(d => d.colour)}
                    />
                )}
            </div>

            {noData && <NoDataText />}
        </div>
    )

    const tabs = [
        { tab: { icon: ClockIcon, label: 'Temporal' }, content: temporalContent },
        { tab: { icon: ChartBarIcon, label: 'Bars' }, content: stackedContent },
    ]

    return (
        <VisualisationCard
            id="ct-annual-registrations-by-disease"
            dataset="clinical-trials"
            filenameToFetch={clinicalTrialsFullDataFilename}
            filteredFileName={clinicalTrialsFilteredDataFilename}
            title="Global annual number of clinical research registrations for studies on diseases with a pandemic potential"
            subtitle="The chart shows the number of clinical research records by the year of registration in ICTRP."
            footnote="Please note: records may fall under more than one disease, so the diseases shown for a year may sum to more than the number of records; records with no disease recorded are not shown."
            tabs={tabs}
        />
    )
}
