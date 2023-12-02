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

const ColourScale = dynamic(() => import('./ColourScale'), {ssr: false})

export default function Map() {
    const {tooltipRef} = useContext(TooltipContext)

    const {grants: dataset} = useContext(GlobalFilterContext)

    const router = useRouter()

    const [displayWhoRegions, setDisplayWhoRegions] = useState<boolean>(false)

    const [usingFunderLocation, setUsingFunderLocation] = useState<boolean>(false)

    const [filteredGeojson, colourScale] = useMemo(() => {
        const geojsonPropertiesToAssign: {[key: string]: any} = getGeojsonPropertiesByIso2(dataset, displayWhoRegions, usingFunderLocation)

        const filteredGeojson = {...geojson}

        filteredGeojson.features = filteredGeojson.features.map((country: any) => {
            const existingProperties: any = country.properties

            const propertiesToAssign: any = geojsonPropertiesToAssign.find(
                (properties: any) => properties.iso2.includes(existingProperties.ISO_A2_EH)
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
            .range(["#dbeafe", "#3b82f6"])

        return [filteredGeojson, colourScale]
    }, [dataset, displayWhoRegions, usingFunderLocation])

    const onGeoClick = (geo: any) => {
        let queryFilters: any = {}

        if (displayWhoRegions) {
            queryFilters[usingFunderLocation ? 'FunderRegion' : 'ResearchInstitutionRegion'] = [geo.properties.NAME]
        } else {
            queryFilters[usingFunderLocation ? 'FunderCountry' : 'ResearchInstitutionCountry'] = [geo.properties.ISO_A2_EH]
        }

        router.push('/grants?filters=' + JSON.stringify(queryFilters))
    }

    const onGeoMouseEnterOrMove = (event: MouseEvent<SVGPathElement>, geo: any) => {
        tooltipRef?.current?.open({
            position: {
                x: event.clientX,
                y: event.clientY,
            },
            place: 'bottom',
            content: 'Where am I? 😕😕',
        })
    }

    const onGeoMouseLeave = () => {
        tooltipRef?.current?.close()
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
                                fill={geo.properties.totalGrants ? colourScale(geo.properties.totalGrants) : "#D6D6DA"}
                                stroke="#FFFFFF"
                                strokeWidth={1}
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

            <div className="grid grid-cols-3">
                <ColourScale colourScale={colourScale} />

                <div className="justify-self-center mt-4">
                    <DoubleLabelSwitch
                        checked={displayWhoRegions}
                        onChange={setDisplayWhoRegions}
                        leftLabel="Countries"
                        rightLabel="WHO Regions"
                        screenReaderLabel="Display WHO Regions"
                    />
                </div>

                <div className="justify-self-center mt-4">
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

function getGeojsonPropertiesByIso2(dataset: any[], displayWhoRegions: boolean, usingFunderLocation: boolean) {
    if (displayWhoRegions) {
        const whoRegions = Object.keys(regionToCountryMapping)

        const grantsGroupedByRegion = groupBy(
            dataset,
            usingFunderLocation ? 'FunderRegion' : 'ResearchInstitutionRegion'
        )

        return whoRegions.map(region => {
            const grants = grantsGroupedByRegion[region]

            const totalGrants = grants?.length ?? 0

            const totalAmountCommitted = grants?.reduce(...sumNumericGrantAmounts) ?? 0

            return {
                iso2: regionToCountryMapping[region as keyof typeof regionToCountryMapping],
                properties: {
                    NAME: region,
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
            iso2: [country],
            properties: {
                totalGrants: grants.length,
                totalAmountCommitted: grants.reduce(...sumNumericGrantAmounts),
            }
        })
    )
}
