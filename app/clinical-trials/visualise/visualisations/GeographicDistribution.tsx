'use client'

import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts'
import {
    GlobeIcon,
    ChartBarIcon,
    ArrowLeftIcon,
    InformationCircleIcon,
    XIcon,
} from '@heroicons/react/solid'
import { scaleLog } from 'd3-scale'
import { ColorTranslator } from 'colortranslator'

import VisualisationCard from '../../../components/VisualisationCard'
import {
    clinicalTrialsFullDataFilename,
    clinicalTrialsFilteredDataFilename,
} from '../../../helpers/export'
import DoubleLabelSwitch from '../../../components/DoubleLabelSwitch'
import Button from '../../../components/Button'
import Switch from '../../../components/Switch'
import TooltipContent from '../../../components/TooltipContent'
import NoDataText from '../../../components/NoData/NoDataText'
import CoLocatedFeaturesModal, { CoLocatedFeature } from './CoLocatedFeaturesModal'
import InteractiveMap from '../../../components/GrantsByCountryWhereResearchWasConducted/Map/InteractiveMap'
import ColourScale from '../../../components/GrantsByCountryWhereResearchWasConducted/Map/ColourScale'
import { GlobalFilterContext } from '../../../helpers/filters'
import { regionColours, brandColours } from '../../../helpers/colours'
import { rechartBaseTooltipProps } from '../../../helpers/tooltip'
import { DeckGLRefContext, DeckGlRef } from '../../../helpers/deck-gl'
import { useSelectOptions } from './useSelectOptions'
import regionToCountryMapping from '../../../../data/source/region-to-country-mapping.json'
import countriesGeojson from '../../../../public/data/geojson/countries.json'
import whoRegionsGeojson from '../../../../public/data/geojson/who-regions.json'

/**
 * Visualisation 1 — Geographical distribution of clinical research locations /
 * institutions. The data-field toggle (Research Location vs Research Institution)
 * uses the shared DoubleLabelSwitch, while the card tabs switch between the Map
 * (deck.gl choropleth) and Bars (region -> country drill-down) views — matching
 * the grants reference visualisation. Location and institution are treated
 * independently (Technical Spec §6.1).
 */

type Source = 'location' | 'institution'

const FIELDS: Record<Source, { region: string; country: string }> = {
    location: { region: 'ResearchLocationRegion', country: 'ResearchLocationCountry' },
    institution: { region: 'ResearchInstitutionRegion', country: 'ResearchInstitutionCountry' },
}

const FALLBACK_COLOUR = brandColours.grey['400']
const NO_DATA_COLOUR = '#D6D6DA'

function toDeckGlRgb(colour: string): [number, number, number] {
    const c = new ColorTranslator(colour)
    return [c.R, c.G, c.B]
}

// ---------------------------------------------------------------------------
// Map view (deck.gl choropleth, coloured by trial count — like the reference)
// ---------------------------------------------------------------------------
function GeographyMap({ source }: { source: Source }) {
    const { grants: trials } = useContext(GlobalFilterContext)

    const [displayWhoRegions, setDisplayWhoRegions] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [highlightCoLocated, setHighlightCoLocated] = useState(false)

    // deck.gl (WebGL) and the fixed-size recharts legend are not server-renderable
    // without hydration mismatches, so the map is mounted client-side only.
    const [mounted, setMounted] = useState(false)
    const deckGlRef = useRef<DeckGlRef>(null)
    useEffect(() => setMounted(true), [])

    // Reset the selection (and any co-located highlight) when the field or the
    // country/region level changes — feature ids differ between levels.
    useEffect(() => {
        setSelectedId(null)
        setHighlightCoLocated(false)
    }, [source, displayWhoRegions])

    const countryLabels = useSelectOptions(FIELDS[source].country)
    const regionLabels = useSelectOptions(FIELDS[source].region)

    const activeField = displayWhoRegions ? FIELDS[source].region : FIELDS[source].country
    const labels = displayWhoRegions ? regionLabels : countryLabels
    const sourceGeojson = displayWhoRegions ? whoRegionsGeojson : countriesGeojson

    const coLocatedActive = highlightCoLocated && selectedId !== null

    const { geojson, colourScale, dataIsUnavailable, coLocatedTotal } = useMemo(() => {
        // Overall trial count per feature (drives the default teal choropleth and
        // the "/ total" figures shown in the breakdown).
        const counts = new Map<string, number>()
        trials.forEach((t: any) => {
            ;(t[activeField] ?? []).forEach((code: string) => {
                if (!code || code === 'N/A') return
                counts.set(code, (counts.get(code) ?? 0) + 1)
            })
        })

        // When highlighting co-located studies, count — in a single pass — how
        // many multi-location trials each other feature shares with the selected
        // one. A trial is co-located with the selection when its active-field
        // array includes the selected id and spans more than one location.
        const shared = new Map<string, number>()
        let selectedCoLocatedTotal = 0
        if (coLocatedActive) {
            trials.forEach((t: any) => {
                const codes: string[] = t[activeField] ?? []
                if (codes.length > 1 && codes.includes(selectedId!)) {
                    selectedCoLocatedTotal++
                    codes.forEach(code => {
                        if (!code || code === 'N/A' || code === selectedId) return
                        shared.set(code, (shared.get(code) ?? 0) + 1)
                    })
                }
            })
        }

        const tealMax = Math.max(2, ...Array.from(counts.values()))
        const tealScale = scaleLog<string>()
            .domain([1, tealMax])
            .range([brandColours.teal['300'], brandColours.teal['700']])
            .clamp(true)

        const orangeMax = Math.max(2, ...Array.from(shared.values()))
        const orangeScale = scaleLog<string>()
            .domain([1, orangeMax])
            .range([brandColours.orange['300'], brandColours.orange['700']])
            .clamp(true)

        const scale = coLocatedActive ? orangeScale : tealScale

        const features = (sourceGeojson as any).features.map((feature: any) => {
            const id = String(feature.properties.id)
            const count = counts.get(id) ?? 0
            const coLocatedCount = shared.get(id) ?? 0
            const isSelected = id === selectedId

            let fill: string
            if (isSelected) {
                fill = brandColours.blue['600']
            } else if (coLocatedActive) {
                fill = coLocatedCount > 0 ? (orangeScale(coLocatedCount) as string) : NO_DATA_COLOUR
            } else {
                fill = count > 0 ? (tealScale(count) as string) : NO_DATA_COLOUR
            }

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    id,
                    name: labels[id] ?? id,
                    count,
                    coLocatedCount,
                    fillColour: toDeckGlRgb(fill),
                },
            }
        })

        return {
            geojson: { ...(sourceGeojson as any), features },
            colourScale: scale,
            dataIsUnavailable: features.every((f: any) => f.properties.count === 0),
            coLocatedTotal: selectedCoLocatedTotal,
        }
    }, [trials, activeField, labels, sourceGeojson, selectedId, coLocatedActive])

    const selected = selectedId
        ? geojson.features.find((f: any) => f.properties.id === selectedId)?.properties
        : null

    // Features sharing co-located studies with the selection, busiest first.
    const coLocatedFeatures: CoLocatedFeature[] = coLocatedActive
        ? geojson.features
              .map((f: any) => f.properties)
              .filter((p: any) => p.id !== selectedId && p.coLocatedCount > 0)
              .sort((a: any, b: any) => b.coLocatedCount - a.coLocatedCount)
              .map((p: any) => ({ name: p.name, count: p.count, coLocatedCount: p.coLocatedCount }))
        : []

    if (!mounted) {
        return <div className="w-full" style={{ height: 520 }} aria-hidden />
    }

    const mapWrapperClasses = [
        'w-full flex flex-col gap-y-4',
        dataIsUnavailable && 'blur-md',
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className="w-full relative">
            <div className={mapWrapperClasses}>
                <DeckGLRefContext.Provider value={deckGlRef}>
                    <div className="breakout">
                        <InteractiveMap geojson={geojson} onClick={setSelectedId} />
                    </div>
                </DeckGLRefContext.Provider>

                {selected && (
                    <MapStatusBar
                        name={selected.name}
                        count={selected.count}
                        field={activeField}
                        id={selected.id}
                        coLocatedAvailable={!displayWhoRegions}
                        highlightCoLocated={highlightCoLocated}
                        setHighlightCoLocated={setHighlightCoLocated}
                        coLocatedTotal={coLocatedTotal}
                        coLocatedFeatures={coLocatedFeatures}
                        onClose={() => {
                            setSelectedId(null)
                            setHighlightCoLocated(false)
                        }}
                    />
                )}

                <div className="flex w-full flex-col items-center gap-y-3 ignore-in-image-export">
                    <ColourScale colourScale={colourScale} displayKnownFinancialCommitments={false} />

                    <DoubleLabelSwitch
                        checked={displayWhoRegions}
                        onChange={setDisplayWhoRegions}
                        leftLabel="Countries"
                        rightLabel="WHO Regions"
                        screenReaderLabel="Display WHO regions instead of countries"
                    />
                </div>
            </div>

            {dataIsUnavailable && <NoDataText />}
        </div>
    )
}

function MapStatusBar({
    name,
    count,
    field,
    id,
    coLocatedAvailable,
    highlightCoLocated,
    setHighlightCoLocated,
    coLocatedTotal,
    coLocatedFeatures,
    onClose,
}: {
    name: string
    count: number
    field: string
    id: string
    /** Co-location is only offered for the Countries view: the precomputed flags
     * are country-based, so a WHO-region-level count can't reconcile with the
     * Explore filter. Hidden when viewing WHO Regions. */
    coLocatedAvailable: boolean
    highlightCoLocated: boolean
    setHighlightCoLocated: (value: boolean) => void
    coLocatedTotal: number
    coLocatedFeatures: CoLocatedFeature[]
    onClose: () => void
}) {
    let href =
        '/clinical-trials/explore?filters=' +
        JSON.stringify({ [field]: [id] })

    if (highlightCoLocated) {
        // Co-location is filtered independently per geography (Technical Spec
        // §6.1), so deep-link to the flag matching the active source — research
        // institution vs research location — to keep this count in step with the
        // highlighted total on the map.
        const coLocatedParam = field.includes('Institution')
            ? 'coLocatedInstitution'
            : 'coLocatedLocation'

        href += `&${coLocatedParam}=only-co-located-trials`
    }

    const showBreakdown = highlightCoLocated && coLocatedFeatures.length > 0
    const geographyNoun = field.includes('Region') ? 'regions' : 'countries'

    return (
        <div className="w-full flex justify-center">
            <div className="w-full lg:max-w-3xl py-2 rounded-lg text-sm shadow-lg border border-brand-grey-200">
                <div className="pb-2 border-b border-brand-grey-200 px-4 flex justify-between items-center">
                    <p className="font-medium text-brand-grey-700">{name}</p>
                    <button onClick={onClose} aria-label="Close map content">
                        <XIcon className="text-brand-grey-700 size-4 hover:scale-[1.2] transition duration-150" aria-hidden="true" />
                    </button>
                </div>

                <div className="px-4 pt-2">
                    <p className="text-brand-grey-700">
                        {highlightCoLocated
                            ? `${coLocatedTotal.toLocaleString()} / ${count.toLocaleString()} co-located clinical trial registration${count === 1 ? '' : 's'}`
                            : `${count.toLocaleString()} clinical trial registration${count === 1 ? '' : 's'}`}
                    </p>
                </div>

                <div
                    className={`px-4 pt-2 flex max-sm:flex-col max-sm:items-center max-sm:gap-y-2 sm:flex-row sm:items-center ${
                        coLocatedAvailable ? 'sm:justify-between' : 'sm:justify-end'
                    }`}
                >
                    {coLocatedAvailable && (
                        <Switch
                            checked={highlightCoLocated}
                            onChange={setHighlightCoLocated}
                            label={`Show co-located ${geographyNoun}`}
                            theme="light"
                            textClassName="text-brand-grey-700"
                        />
                    )}

                    <div className="flex flex-col gap-2 md:flex-row">
                        {showBreakdown && (
                            <CoLocatedFeaturesModal coLocatedFeatures={coLocatedFeatures} />
                        )}

                        {highlightCoLocated
                            ? coLocatedTotal > 0 && (
                                  <Button size="xxsmall" href={href}>
                                      Explore Co-located Clinical Trials
                                  </Button>
                              )
                            : count > 0 && (
                                  <Button size="xxsmall" href={href}>
                                      Explore Clinical Trials
                                  </Button>
                              )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Bars view (region -> country drill-down)
// ---------------------------------------------------------------------------
function GeographyBars({ source }: { source: Source }) {
    const { grants: trials } = useContext(GlobalFilterContext)
    const [drillRegion, setDrillRegion] = useState<string | null>(null)

    const fields = FIELDS[source]
    const regionLabels = useSelectOptions(fields.region)
    const countryLabels = useSelectOptions(fields.country)

    const regionData = useMemo(() => {
        const counts = new Map<string, number>()
        trials.forEach((t: any) => {
            ;(t[fields.region] ?? []).forEach((code: string) => {
                if (!code || code === 'N/A') return
                counts.set(code, (counts.get(code) ?? 0) + 1)
            })
        })
        return Array.from(counts.entries())
            .map(([code, count]) => ({ code, name: regionLabels[code] ?? code, count }))
            .sort((a, b) => b.count - a.count)
    }, [trials, fields.region, regionLabels])

    const countryData = useMemo(() => {
        if (!drillRegion) return []
        const countriesInRegion: string[] =
            regionToCountryMapping[drillRegion as keyof typeof regionToCountryMapping] ?? []

        const counts = new Map<string, number>()
        trials.forEach((t: any) => {
            ;(t[fields.country] ?? []).forEach((code: string) => {
                if (!code || code === 'N/A') return
                if (!countriesInRegion.includes(code)) return
                counts.set(code, (counts.get(code) ?? 0) + 1)
            })
        })
        return Array.from(counts.entries())
            .map(([code, count]) => ({ code, name: countryLabels[code] ?? code, count }))
            .sort((a, b) => b.count - a.count)
    }, [trials, drillRegion, fields.country, countryLabels])

    const showingCountries = drillRegion !== null
    const data = showingCountries ? countryData : regionData

    // Drilled country bars: teal value-scale (matching the map choropleth);
    // region bars: categorical region colour.
    const countryColourScale = useMemo(() => {
        const max = Math.max(2, ...countryData.map(d => d.count))
        return scaleLog<string>()
            .domain([1, max])
            .range([brandColours.teal['300'], brandColours.teal['700']])
            .clamp(true)
    }, [countryData])

    const canDrill = (code: string) =>
        ((regionToCountryMapping[code as keyof typeof regionToCountryMapping] as string[]) ?? [])
            .length > 0

    const colourFor = (entry: { code: string; count: number }) =>
        showingCountries
            ? (countryColourScale(entry.count) as string)
            : regionColours[entry.code] ?? FALLBACK_COLOUR

    const barsTooltip = (props: any) => {
        if (!props.active || !props.payload?.length) return null
        const point = props.payload[0]
        return (
            <TooltipContent
                title={point.payload.name}
                items={[
                    {
                        label: 'Clinical research records',
                        value: point.value.toLocaleString(),
                        colour: colourFor(point.payload),
                    },
                ]}
            />
        )
    }

    return (
        <div className="w-full">
            <div className="flex justify-center items-center gap-x-2 ignore-in-image-export">
                <button
                    type="button"
                    onClick={() => showingCountries && setDrillRegion(null)}
                    className="flex items-center"
                    aria-label={showingCountries ? 'Back to regions' : undefined}
                >
                    {showingCountries ? (
                        <span className="cursor-pointer mr-4 bg-brand-grey-200 p-1.5 rounded-md shadow-lg">
                            <ArrowLeftIcon className="size-6 text-brand-grey-500" />
                        </span>
                    ) : (
                        <span className="cursor-default">
                            <InformationCircleIcon className="size-7 text-brand-grey-500" />
                        </span>
                    )}
                </button>

                <p className="text-brand-grey-500">
                    {showingCountries
                        ? `Viewing countries in ${regionLabels[drillRegion] ?? drillRegion}.`
                        : 'Click a region bar to expand to countries'}
                </p>
            </div>

            <div style={{ width: '100%', height: 460 }} className="mt-4">
                <ResponsiveContainer>
                    <BarChart layout="vertical" data={data} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} interval={0} />
                        <Tooltip
                            content={barsTooltip}
                            cursor={{ fill: 'transparent' }}
                            {...rechartBaseTooltipProps}
                        />
                        <Bar
                            dataKey="count"
                            name="Registrations"
                            cursor={showingCountries ? 'default' : 'pointer'}
                            onClick={(entry: any) => {
                                if (!showingCountries && entry?.code && canDrill(entry.code)) {
                                    setDrillRegion(entry.code)
                                }
                            }}
                        >
                            {data.map(entry => (
                                <Cell
                                    key={entry.code}
                                    fill={
                                        showingCountries
                                            ? countryColourScale(entry.count)
                                            : regionColours[entry.code] ?? FALLBACK_COLOUR
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
export default function GeographicDistribution() {
    const [source, setSource] = useState<Source>('location')

    const tabs = [
        { tab: { icon: GlobeIcon, label: 'Map' }, content: <GeographyMap source={source} /> },
        { tab: { icon: ChartBarIcon, label: 'Bars' }, content: <GeographyBars source={source} /> },
    ]

    return (
        <VisualisationCard
            id="ct-geographic-distribution"
            dataset="clinical-trials"
            filenameToFetch={clinicalTrialsFullDataFilename}
            filteredFileName={clinicalTrialsFilteredDataFilename}
            title="Global Map of Geographical Distribution of Clinical Research Institutions OR Clinical Research Locations"
            subtitle="The information on the research location and research institution was collected where available from the clinical research registration. Click on a country (map) or region bar to see country or region-specific information (including records with multiple locations)."
            footnote="Please note: some research activities are undertaken in multiple locations or research institutions. Research location refers to the country where study recruitment occurs whereas the research institution refers to the institution leading the research."
            tabs={tabs}
        >
            <div className="w-full flex justify-center ignore-in-image-export">
                <DoubleLabelSwitch
                    checked={source === 'institution'}
                    onChange={checked => setSource(checked ? 'institution' : 'location')}
                    leftLabel="Research Location"
                    rightLabel="Research Institution"
                    screenReaderLabel="Toggle between research location and research institution"
                />
            </div>
        </VisualisationCard>
    )
}
