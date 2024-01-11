import {useState, useMemo, useContext, MouseEvent} from 'react'
import {useRouter} from 'next/navigation'
import dynamic from 'next/dynamic'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import DoubleLabelSwitch from "../DoubleLabelSwitch"
import {scaleLinear} from "d3-scale"
import {groupBy} from 'lodash'
import {GlobalFilterContext} from "../../helpers/filter"
import geojson from '../../../data/source/geojson/ne_110m_admin_0_countries.json'
import regionToCountryMapping from '../../../data/source/region-to-country-mapping.json'
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {TooltipContext} from '../../helpers/tooltip'
import {brandColours} from '../../helpers/colours'
import selectOptions from '../../../data/dist/select-options.json'

const ColourScale = dynamic(() => import('./ColourScale'), {ssr: false})

export default function Map() {
    const {tooltipRef} = useContext(TooltipContext)

    const {grants: dataset} = useContext(GlobalFilterContext)

    const router = useRouter()

    const [displayWhoRegions, setDisplayWhoRegions] = useState<boolean>(false)

    const [usingFunderLocation, setUsingFunderLocation] = useState<boolean>(false)

    const [filteredGeojson, colourScale] = useMemo(() => {
        const geojsonPropertiesToAssign: {[key: string]: any} = getGeojsonPropertiesByIsoNumeric(dataset, displayWhoRegions, usingFunderLocation)

        const filteredGeojson = {...geojson}

        filteredGeojson.features = filteredGeojson.features.map((country: any) => {
            const existingProperties: any = country.properties

            const propertiesToAssign: any = geojsonPropertiesToAssign.find(
                (properties: any) => properties.isoNumeric.includes(existingProperties.ISO_N3_EH)
            )

            const newProperties = propertiesToAssign?.properties || {}

            return {
                ...country,
                properties: {
                    ...existingProperties,
                    ...newProperties,
                },
            }
        })

        const allTotalGrants = filteredGeojson
            .features
            .filter((country: any) => country.properties.totalGrants)
            .map((country: any) => country.properties.totalGrants)

        const colourScale = scaleLinear<string>()
            .domain([0, Math.max(...allTotalGrants)])
            .range([brandColours.teal['300'], brandColours.teal['700']])

        return [filteredGeojson, colourScale]
    }, [dataset, displayWhoRegions, usingFunderLocation])

    const onGeoClick = (geo: any) => {
        let queryFilters: any = {}

        if (displayWhoRegions) {
            queryFilters[usingFunderLocation ? 'FunderRegion' : 'ResearchInstitutionRegion'] = [geo.properties.regionValue]
        } else {
            queryFilters[usingFunderLocation ? 'FunderCountry' : 'ResearchInstitutionCountry'] = [geo.properties.ISO_N3_EH]
        }

        router.push('/grants?filters=' + JSON.stringify(queryFilters))
    }

    const onGeoMouseEnterOrMove = (event: MouseEvent<SVGPathElement>, geo: any) => {
        tooltipRef?.current?.open({
            position: {
                x: event.clientX,
                y: event.clientY,
            },
            content: <TooltipContent geo={geo} displayWhoRegions={displayWhoRegions} />,
        })
    }

    const onGeoMouseLeave = () => {
        tooltipRef?.current?.close()
    }

    const getColourOfGeo = (geo: any) => {
        return geo.properties.totalGrants ? colourScale(geo.properties.totalGrants) : "#D6D6DA"
    }

    return (
        <div className="w-full h-full">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 110,
                    center: [0, 40],
                }}
                height={500}
            >
                <Geographies geography={filteredGeojson}>
                    {({geographies}) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={getColourOfGeo(geo)}
                                stroke={displayWhoRegions ? getColourOfGeo(geo) : "#FFFFFF"}
                                strokeWidth={displayWhoRegions ? 0.5 : 1.0}
                                className="cursor-pointer"
                                onClick={() => onGeoClick(geo)}
                                onMouseEnter={event => onGeoMouseEnterOrMove(event, geo)}
                                onMouseMove={event => onGeoMouseEnterOrMove(event, geo)}
                                onMouseLeave={onGeoMouseLeave}
                            />
                        ))
                    }
                </Geographies>
            </ComposableMap>

            <div className="grid gap-4 md:grid-cols-3">
                <ColourScale colourScale={colourScale} />

                <div className="justify-self-center">
                    <DoubleLabelSwitch
                        checked={displayWhoRegions}
                        onChange={setDisplayWhoRegions}
                        leftLabel="Countries"
                        rightLabel="WHO Regions"
                        screenReaderLabel="Display WHO Regions"
                    />
                </div>

                <div className="justify-self-center">
                    <DoubleLabelSwitch
                        checked={usingFunderLocation}
                        onChange={setUsingFunderLocation}
                        leftLabel="Research Institution"
                        rightLabel="Funder"
                        screenReaderLabel="Using Funder Location"
                    />
                </div>
            </div>
        </div >
    )
}

function TooltipContent({geo, displayWhoRegions}: {geo: any, displayWhoRegions: boolean}) {
    return (
        <div className="flex flex-col gap-y-4">
            <p className="font-bold text-lg">{geo.properties.NAME}</p>

            <div>
                <p className="text-md">Grants: {geo.properties.totalGrants || 0}</p>
                <p className="text-md">Known Financial Commitments: {dollarValueFormatter(geo.properties.totalAmountCommitted || 0)}</p>
            </div>

            <p className="text-md italic">Click to explore grants in this {displayWhoRegions ? 'region' : 'country'}</p>
        </div>
    )
}

function getGeojsonPropertiesByIsoNumeric(dataset: any[], displayWhoRegions: boolean, usingFunderLocation: boolean) {
    if (displayWhoRegions) {
        const whoRegions = Object.keys(regionToCountryMapping)

        const regionKey = usingFunderLocation ? 'FunderRegion' : 'ResearchInstitutionRegion'

        const grantsGroupedByRegion = groupBy(dataset, regionKey)

        return whoRegions.map(region => {
            const grants = grantsGroupedByRegion[region]

            const totalGrants = grants?.length ?? 0

            const totalAmountCommitted = grants?.reduce(...sumNumericGrantAmounts) ?? 0

            const regionName = selectOptions[regionKey].find(option => option.value === region)?.label

            return {
                isoNumeric: regionToCountryMapping[region as keyof typeof regionToCountryMapping],
                properties: {
                    NAME: regionName,
                    regionValue: region,
                    totalGrants,
                    totalAmountCommitted,
                }
            }
        })
    }

    return Object.entries(
        groupBy(
            dataset,
            usingFunderLocation ? 'FunderCountry' : 'ResearchInstitutionCountry'
        )
    ).map(
        ([country, grants]) => ({
            isoNumeric: [country.padStart(3, '0')],
            properties: {
                totalGrants: grants.length,
                totalAmountCommitted: grants.reduce(...sumNumericGrantAmounts),
            }
        })
    )
}
