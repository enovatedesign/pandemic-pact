import { useState, useEffect, useMemo, useContext, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from 'react-simple-maps'
import DoubleLabelSwitch from '../DoubleLabelSwitch'
import TooltipContent from '../TooltipContent'
import { scaleLinear } from 'd3-scale'
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

export default function Map() {
    const { tooltipRef } = useContext(TooltipContext)

    const { grants: dataset } = useContext(GlobalFilterContext)

    const router = useRouter()

    const [displayWhoRegions, setDisplayWhoRegions] = useState<boolean>(false)

    const [usingFunderLocation, setUsingFunderLocation] =
        useState<boolean>(false)

    let grantField:
        | 'FunderRegion'
        | 'ResearchInstitutionRegion'
        | 'FunderCountry'
        | 'ResearchInstitutionCountry'

    if (displayWhoRegions) {
        grantField = usingFunderLocation
            ? 'FunderRegion'
            : 'ResearchInstitutionRegion'
    } else {
        grantField = usingFunderLocation
            ? 'FunderCountry'
            : 'ResearchInstitutionCountry'
    }

    const [geojson, colourScale] = useMemo(() => {
        const geojson = displayWhoRegions
            ? { ...whoRegionGeojson }
            : { ...countryGeojson }

        geojson.features = geojson.features.map((feature: any) => {
            const id = feature.properties.id

            const name = selectOptions[grantField].find(
                option => option.value === id
            )?.label

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

        const allTotalGrants = geojson.features
            .filter((country: any) => country.properties.totalGrants)
            .map((country: any) => country.properties.totalGrants)

        const colourScale = scaleLinear<string>()
            .domain([0, Math.max(...allTotalGrants)])
            .range([brandColours.teal['300'], brandColours.teal['700']])

        return [geojson, colourScale]
    }, [dataset, displayWhoRegions, grantField])

    const onGeoClick = (geo: any) => {
        const queryFilters = {
            [grantField]: geo.properties.id,
        }

        router.push('/grants?filters=' + JSON.stringify(queryFilters))
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

    const getColourOfGeo = (geo: any) => {
        return geo.properties.totalGrants
            ? colourScale(geo.properties.totalGrants)
            : '#D6D6DA'
    }

    const [height, setHeight] = useState(650)
    const [scale, setScale] = useState(120)

    useEffect(() => {
        const handleHeight = () => {
            if (window.innerWidth > 1024) {
                setHeight(300)
                setScale(80)
            } else {
                setHeight(650)
                setScale(120)
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

    return (
        <div className="w-full h-full flex flex-col gap-y-4">
            <div className="breakout">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: scale,
                        center: [0, 40],
                    }}
                    height={height}
                >
                    <ZoomableGroup center={[0, 40]}>
                        <Geographies geography={geojson}>
                            {({ geographies }) =>
                                geographies.map(geo => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={getColourOfGeo(geo)}
                                        stroke="#FFFFFF"
                                        strokeWidth={1.0}
                                        className="cursor-pointer"
                                        onClick={() => onGeoClick(geo)}
                                        onMouseEnter={event =>
                                            onGeoMouseEnterOrMove(event, geo)
                                        }
                                        onMouseMove={event =>
                                            onGeoMouseEnterOrMove(event, geo)
                                        }
                                        onMouseLeave={onGeoMouseLeave}
                                    />
                                ))
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            </div>

            <div
                className={`flex flex-col items-center gap-y-2 ${
                    !sidebarOpen &&
                    'xl:flex-row xl:justify-between xl:gap-y-0 xl:gap-x-2'
                }`}
            >
                <ColourScale colourScale={colourScale} />

                <div className="xl:self-center xl:-translate-y-[14px]">
                    <DoubleLabelSwitch
                        checked={displayWhoRegions}
                        onChange={setDisplayWhoRegions}
                        leftLabel="Countries"
                        rightLabel="WHO Regions"
                        screenReaderLabel="Display WHO Regions"
                    />
                </div>

                <div className="xl:self-center xl:-translate-y-[14px]">
                    <DoubleLabelSwitch
                        checked={usingFunderLocation}
                        onChange={setUsingFunderLocation}
                        leftLabel="Research Institution"
                        rightLabel="Funder"
                        screenReaderLabel="Using Funder Location"
                    />
                </div>
            </div>
        </div>
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
