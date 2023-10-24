import {useState, useMemo} from 'react'
import {useRouter} from 'next/navigation'
import dynamic from 'next/dynamic'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import DoubleLabelSwitch from "../DoubleLabelSwitch"
import {scaleLinear} from "d3-scale"
import {Tooltip} from 'react-tooltip'
import {groupBy} from 'lodash'
import geojson from '../../../data/source/geojson/ne_110m_admin_0_countries.json'
import regionToCountryMapping from '../../../data/source/region-to-country-mapping.json'
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {sumNumericGrantAmounts} from "../../helpers/reducers"

const ColourScale = dynamic(() => import('./ColourScale'), {ssr: false})

interface Props {
    dataset: any[]
}

export default function Map({dataset}: Props) {
    const router = useRouter()

    const [tooltipContent, setTooltipContent] = useState('')

    const [displayWhoRegions, setDisplayWhoRegions] = useState<boolean>(false)

    const [filteredGeojson, colourScale] = useMemo(() => {
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

        const colourScale = scaleLinear<string>()
            .domain([0, Math.max(...allTotalGrants)])
            .range(["#dbeafe", "#3b82f6"])

        return [filteredGeojson, colourScale]
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
                                fill={geo.properties.totalGrants ? colourScale(geo.properties.totalGrants) : "#D6D6DA"}
                                stroke="#FFFFFF"
                                strokeWidth={1}
                                className="cursor-pointer"
                                onMouseEnter={() => {
                                    setTooltipContent(`
                                                    <div>
                                                        <p class="font-bold text-lg mb-4">${geo.properties.NAME}</p>

                                                        <p class="text-md">Grants: ${geo.properties.totalGrants || 0}</p>
                                                        <p class="text-md">Amount Committed: ${dollarValueFormatter(geo.properties.totalAmountCommitted || 0)}</p>

                                                        <p class="text-md italic mt-4">Click to explore grants in this ${displayWhoRegions ? 'region' : 'country'}</p>
                                                    </div>
                                                `)
                                }}
                                onMouseLeave={() => {
                                    setTooltipContent('')
                                }}
                                onClick={() => {
                                    if (displayWhoRegions) {
                                        router.push('/grants?filters=' + JSON.stringify({
                                            ResearchInstitutionRegion: [geo.properties.NAME],
                                        }))
                                    } else {
                                        router.push('/grants?filters=' + JSON.stringify({
                                            ResearchInstitutionCountry: [geo.properties.ISO_A2_EH],
                                        }))
                                    }
                                }}
                                data-tooltip-id="country-tooltip"
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
            </div>

            <Tooltip
                id="country-tooltip"
                float={true}
                isOpen={tooltipContent !== ''}
                noArrow={true}
                place="right-start"
                offset={10}
                className="!px-3 !py-2 text-left"
                variant="light"
            >
                <div dangerouslySetInnerHTML={{__html: tooltipContent}} />
            </Tooltip>
        </div >
    )
}

function getGeojsonPropertiesByIso2(dataset: any[], displayWhoRegions: boolean) {
    if (displayWhoRegions) {
        const whoRegions = Object.keys(regionToCountryMapping)

        const grantsGroupedByRegion = groupBy(dataset, 'ResearchInstitutionRegion')

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
