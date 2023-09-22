import {useState} from 'react'
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {scaleLinear} from "d3-scale"
import {Tooltip} from 'react-tooltip'
import countriesGeoJson from '../../../data/source/geojson/ne_110m_admin_0_countries.json'
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {sumNumericGrantAmounts} from "../../helpers/reducers"

interface Props {
    dataset: any[]
}

export default function Map({dataset}: Props) {
    const [tooltipContent, setTooltipContent] = useState('')

    const geojson: any = countriesGeoJson

    let filteredCountriesGeoJson = geojson

    filteredCountriesGeoJson.features = filteredCountriesGeoJson.features.map((country: any) => {
        let properties: any = country.properties

        const filteredDataset = dataset.filter(
            (grant: any) => grant.ResearchInstitutionCountry === country.properties.ISO_A2
        )

        properties.totalGrants = filteredDataset.length

        properties.totalAmountCommitted = filteredDataset.reduce(...sumNumericGrantAmounts)

        country.properties = properties

        return country
    })

    const allTotalGrants = filteredCountriesGeoJson
        .features
        .filter((country: any) => country.properties.totalGrants)
        .map((country: any) => country.properties.totalGrants)

    const colorScale = scaleLinear<string>()
        .domain([
            Math.min(...allTotalGrants),
            Math.max(...allTotalGrants),
        ])
        .range(["#dbeafe", "#3b82f6"])

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
                <Geographies geography={geojson}>
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
