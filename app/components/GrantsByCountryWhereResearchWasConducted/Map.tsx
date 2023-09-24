import {useState, useMemo} from 'react'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {scaleLinear} from "d3-scale"
import {Tooltip} from 'react-tooltip'
import {groupBy} from 'lodash'
import geojson from '../../../data/source/geojson/ne_110m_admin_0_countries.json'
import regionToCountryMapping from '../../../data/source/region-to-country-mapping.json'
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {sumNumericGrantAmounts} from "../../helpers/reducers"

interface Props {
    dataset: any[]
    displayWhoRegions: boolean
}

export default function Map({dataset, displayWhoRegions}: Props) {
    const [tooltipContent, setTooltipContent] = useState('')

    const [filteredGeojson, colorScale] = useMemo(() => {
        const geojsonPropertiesToAssign: {[key: string]: any} = getGeojsonPropertiesByIso2(dataset, displayWhoRegions)

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

        const colorScale = scaleLinear<string>()
            .domain([
                Math.min(...allTotalGrants),
                Math.max(...allTotalGrants),
            ])
            .range(["#dbeafe", "#3b82f6"])

        return [filteredGeojson, colorScale]
    }, [dataset, displayWhoRegions])

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
                                fill={geo.properties.totalGrants ? colorScale(geo.properties.totalGrants) : "#D6D6DA"}
                                stroke="#FFFFFF"
                                strokeWidth={1}
                                onMouseEnter={() => {
                                    setTooltipContent(`
                                                    <div>
                                                        <p class="font-bold">${geo.properties.NAME}</p>
                                                        <p class="text-xs">Grants: ${geo.properties.totalGrants || 0}</p>
                                                        <p class="text-xs">Amount Committed: ${dollarValueFormatter(geo.properties.totalAmountCommitted || 0)}</p>
                                                    </div>
                                                `)
                                }}
                                onMouseLeave={() => {
                                    setTooltipContent('')
                                }}
                                data-tooltip-id="country-tooltip"
                            />
                        ))
                    }
                </Geographies>
            </ComposableMap>

            <Tooltip
                id="country-tooltip"
                float={true}
                isOpen={tooltipContent !== ''}
                noArrow={true}
                place="right-start"
                offset={10}
                className="!px-3 !py-2 text-left"
            >
                <div dangerouslySetInnerHTML={{__html: tooltipContent}} />
            </Tooltip>
        </div >
    )
}

function getGeojsonPropertiesByIso2(dataset: any[], displayWhoRegions: boolean) {
    if (displayWhoRegions) {
        return Object.entries(
            groupBy(dataset, 'ResearchInstitutionRegion'),
        ).map(
            ([region, grants]) => ({
                iso2: regionToCountryMapping[region as keyof typeof regionToCountryMapping],
                properties: {
                    NAME: region,
                    totalGrants: grants.length,
                    totalAmountCommitted: grants.reduce(...sumNumericGrantAmounts),
                }
            })
        )
    }

    return Object.entries(
        groupBy(dataset, 'ResearchInstitutionCountry'),
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
