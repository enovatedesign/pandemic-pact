import { useState, useMemo, useContext } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import DoubleLabelSwitch from '../DoubleLabelSwitch'
import RadioGroup from '../RadioGroup'
import TooltipContent from '../TooltipContent'
import { scaleLog } from 'd3-scale'
import { GlobalFilterContext, SidebarStateContext } from '../../helpers/filters'
import countryGeojson from '../../../public/data/geojson/countries.json'
import whoRegionGeojson from '../../../public/data/geojson/who-regions.json'
import { dollarValueFormatter } from '../../helpers/value-formatters'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { TooltipContext } from '../../helpers/tooltip'
import { brandColours } from '../../helpers/colours'
import selectOptions from '../../../data/dist/select-options.json'
import InteractiveMap from './InteractiveMap'

const ColourScale = dynamic(() => import('./ColourScale'), { ssr: false })

type LocationType = 'Funder' | 'ResearchInstitution' | 'ResearchLocation'

export default function Map() {
    const { grants: dataset } = useContext(GlobalFilterContext)

    const { tooltipRef } = useContext(TooltipContext)

    const router = useRouter()

    const onMouseEnterOrMove = (
        position: { x: number; y: number },
        properties: any,
    ) => {
        tooltipRef?.current?.open({
            position,
            content: (
                <MapTooltipContent
                    properties={properties}
                    displayWhoRegions={displayWhoRegions}
                />
            ),
        })
    }

    const onMouseLeave = () => {
        tooltipRef?.current?.close()
    }

    const onClick = (properties: any) => {
        const queryFilters = {
            [grantField]: [properties.id],
        }

        router.push('/grants?filters=' + JSON.stringify(queryFilters))
    }

    const [displayWhoRegions, setDisplayWhoRegions] = useState<boolean>(false)

    const [locationType, setColumn] = useState<LocationType>('Funder')

    const [
        displayKnownFinancialCommitments,
        setDisplayKnownFinancialCommitments,
    ] = useState<boolean>(false)

    const grantField = locationType + (displayWhoRegions ? 'Region' : 'Country')

    const [geojson, colourScale] = useMemo(() => {
        const geojson = displayWhoRegions
            ? { ...whoRegionGeojson }
            : { ...countryGeojson }

        geojson.features = geojson.features.map((feature: any) => {
            const id = feature.properties.id

            const name = selectOptions[
                grantField as keyof typeof selectOptions
            ].find(option => option.value === id)?.label

            const grants = dataset.filter(grant =>
                grant[grantField].includes(id),
            )

            const totalGrants = grants.length

            const totalAmountCommitted = grants.reduce(
                ...sumNumericGrantAmounts,
            )

            return {
                ...feature,
                properties: {
                    id,
                    name,
                    totalGrants,
                    totalAmountCommitted,
                },
            }
        })

        const key = displayKnownFinancialCommitments
            ? 'totalAmountCommitted'
            : 'totalGrants'

        const allTotalGrants = geojson.features
            .filter((country: any) => country.properties[key])
            .map((country: any) => country.properties[key])

        const colourScale = scaleLog<string>()
            .domain([Math.min(...allTotalGrants), Math.max(...allTotalGrants)])
            .range([brandColours.teal['300'], brandColours.teal['700']])

        geojson.features = geojson.features.map((feature: any) => {
            const value = feature.properties[key] ?? null

            const colour = value ? colourScale(value) : '#D6D6DA'

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    colour,
                },
            }
        })

        return [geojson, colourScale]
    }, [
        dataset,
        displayKnownFinancialCommitments,
        displayWhoRegions,
        grantField,
    ])

    const { sidebarOpen } = useContext(SidebarStateContext)

    return (
        <div className="w-full h-full flex flex-col gap-y-4">
            <div className="breakout">
                <InteractiveMap
                    geojson={geojson}
                    onMouseEnterOrMove={onMouseEnterOrMove}
                    onMouseLeave={onMouseLeave}
                    onClick={onClick}
                />
            </div>

            <div
                className={`flex flex-col w-full rounded-md overflow-hidden ${
                    sidebarOpen ? 'flex-col' : 'xl:flex-row'
                }`}
            >
                <div
                    className={`w-full ${
                        !sidebarOpen && 'xl:w-4/6'
                    } bg-gradient-to-b from-gray-50 to-gray-100 h-full flex items-center justify-center pt-3`}
                >
                    <ColourScale
                        colourScale={colourScale}
                        displayKnownFinancialCommitments={
                            displayKnownFinancialCommitments
                        }
                    />
                </div>

                <div className="flex w-full flex-col items-start py-3 xl:py-6 px-4 bg-gradient-to-b from-primary-lightest to-primary-lighter gap-y-2 md:flex-row md:justify-between md:gap-y-0 ignore-in-image-export">
                    <DoubleLabelSwitch
                        checked={displayWhoRegions}
                        onChange={setDisplayWhoRegions}
                        leftLabel="Countries"
                        rightLabel="WHO Regions"
                        screenReaderLabel="Display WHO Regions"
                    />

                    <RadioGroup<LocationType>
                        options={[
                            {
                                label: 'Funder',
                                value: 'Funder',
                            },
                            {
                                label: 'Research Institution',
                                value: 'ResearchInstitution',
                            },
                            {
                                label: 'Research Location',
                                value: 'ResearchLocation',
                            },
                        ]}
                        value={locationType}
                        onChange={setColumn}
                        fieldsetClassName="flex flex-col"
                    />

                    <RadioGroup<boolean>
                        options={[
                            { label: 'Number of grants', value: false },
                            {
                                label: 'Known financial commitments (USD)',
                                value: true,
                            },
                        ]}
                        value={displayKnownFinancialCommitments}
                        onChange={setDisplayKnownFinancialCommitments}
                        fieldsetClassName="flex flex-col"
                    />
                </div>
            </div>
        </div>
    )
}

function MapTooltipContent({
    properties,
    displayWhoRegions,
}: {
    properties: any
    displayWhoRegions: boolean
}) {
    const items = [
        {
            label: 'Grants',
            value: properties.totalGrants || 0,
        },
        {
            label: 'Known Financial Commitments (USD)',
            value: dollarValueFormatter(properties.totalAmountCommitted || 0),
        },
    ]

    return (
        <TooltipContent
            title={properties.name}
            items={items}
            footer={
                <div className="px-4 py-2">
                    <p className="text-right text-sm text-gray-400">
                        Click to explore grants in this{' '}
                        {displayWhoRegions ? 'region' : 'country'}
                    </p>
                </div>
            }
        />
    )
}
