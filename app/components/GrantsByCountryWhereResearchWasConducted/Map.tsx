import { useState, useEffect, useMemo, useContext, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    useZoomPanContext,
} from 'react-simple-maps'
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
import { debounce } from 'lodash'

const ColourScale = dynamic(() => import('./ColourScale'), { ssr: false })

type LocationType = 'Funder' | 'ResearchInstitution' | 'ResearchLocation'

export default function Map() {
    const { grants: dataset } = useContext(GlobalFilterContext)

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
                grant[grantField].includes(id)
            )

            const totalGrants = grants.length

            const totalAmountCommitted = grants.reduce(
                ...sumNumericGrantAmounts
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
            .domain([1, Math.max(...allTotalGrants)])
            .range([brandColours.teal['300'], brandColours.teal['700']])

        return [geojson, colourScale]
    }, [
        dataset,
        displayKnownFinancialCommitments,
        displayWhoRegions,
        grantField,
    ])

    const [height, setHeight] = useState(450)
    const [scale, setScale] = useState(200)

    useEffect(() => {
        const handleHeight = () => {
            if (window.innerWidth > 1024) {
                setHeight(350)
                setScale(125)
            } else {
                setHeight(450)
                setScale(200)
            }
        }

        const debouncedHandleHeight = debounce(handleHeight, 200)

        debouncedHandleHeight()

        window.addEventListener('resize', debouncedHandleHeight)

        return () => {
            window.removeEventListener('resize', debouncedHandleHeight)
        }
    })

    const { sidebarOpen } = useContext(SidebarStateContext)

    const center: [number, number] = [20, 10]

    return (
        <div className="w-full h-full flex flex-col gap-y-4">
            <div className="breakout">
                <ComposableMap
                    projection="geoNaturalEarth1"
                    projectionConfig={{
                        scale,
                        center,
                    }}
                    height={height}
                >
                    <ZoomableGroup center={center}>
                        <GeographiesWithScalingOutlines
                            displayKnownFinancialCommitments={
                                displayKnownFinancialCommitments
                            }
                            displayWhoRegions={displayWhoRegions}
                            grantField={grantField}
                            geojson={geojson}
                            colourScale={colourScale}
                        />
                    </ZoomableGroup>
                </ComposableMap>
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

interface GeographiesWithScalingOutlinesProps {
    displayKnownFinancialCommitments: boolean
    displayWhoRegions: boolean
    grantField: string
    geojson: any
    colourScale: any
}

function GeographiesWithScalingOutlines({
    displayKnownFinancialCommitments,
    displayWhoRegions,
    grantField,
    geojson,
    colourScale,
}: GeographiesWithScalingOutlinesProps) {
    const zoomContext = useZoomPanContext()

    const { tooltipRef } = useContext(TooltipContext)

    const router = useRouter()

    const getColourOfGeo = (geo: any) => {
        const properties = geo.properties

        if (displayKnownFinancialCommitments) {
            return properties.totalAmountCommitted
                ? colourScale(properties.totalAmountCommitted)
                : '#D6D6DA'
        } else {
            return properties.totalGrants
                ? colourScale(properties.totalGrants)
                : '#D6D6DA'
        }
    }

    const onGeoMouseEnterOrMove = (
        event: MouseEvent<SVGPathElement>,
        geo: any
    ) => {
        tooltipRef?.current?.open({
            position: {
                x: event.clientX,
                y: event.clientY,
            },
            content: (
                <MapTooltipContent
                    geo={geo}
                    displayWhoRegions={displayWhoRegions}
                />
            ),
        })
    }

    const onGeoMouseLeave = () => {
        tooltipRef?.current?.close()
    }

    const onGeoClick = (geo: any) => {
        const queryFilters = {
            [grantField]: [geo.properties.id],
        }

        router.push('/grants?filters=' + JSON.stringify(queryFilters))
    }

    return (
        <Geographies geography={geojson}>
            {({ geographies }) =>
                geographies.map(geo => (
                    <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getColourOfGeo(geo)}
                        stroke="#FFFFFF"
                        strokeWidth={1.0 / zoomContext.k}
                        className="cursor-pointer"
                        onClick={() => onGeoClick(geo)}
                        onMouseEnter={event =>
                            onGeoMouseEnterOrMove(event, geo)
                        }
                        onMouseMove={event => onGeoMouseEnterOrMove(event, geo)}
                        onMouseLeave={onGeoMouseLeave}
                    />
                ))
            }
        </Geographies>
    )
}

function MapTooltipContent({
    geo,
    displayWhoRegions,
}: {
    geo: any
    displayWhoRegions: boolean
}) {
    const items = [
        {
            label: 'Grants',
            value: geo.properties.totalGrants || 0,
        },
        {
            label: 'Known Financial Commitments (USD)',
            value: dollarValueFormatter(
                geo.properties.totalAmountCommitted || 0
            ),
        },
    ]

    return (
        <TooltipContent
            title={geo.properties.name}
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
