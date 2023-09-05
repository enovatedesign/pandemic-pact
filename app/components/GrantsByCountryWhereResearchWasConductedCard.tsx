import {useState} from 'react'
import {Flex, Card, Title, Text, MultiSelect, MultiSelectItem} from "@tremor/react"
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {Tooltip} from 'react-tooltip'
import {scaleLinear} from "d3-scale"
import PathogenSelect from "./PathogenSelect"
import ExportToPngButton from "./ExportToPngButton"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"

import dataset from '../../data/dist/grants-by-country-of-research-card.json'
import countriesGeoJson from '../../data/source/geojson/ne_110m_admin_0_countries.json'
import lookupTables from '../../data/source/lookup-tables.json'

export default function GrantsByCountryWhereResearchWasConducted({selectedFilters}: CardProps) {
    const [tooltipContent, setTooltipContent] = useState('')
    const [selectedPathogens, setSelectedPathogens] = useState<string[]>([])

    const filteredDataset = filterGrants(
        dataset,
        {...selectedFilters, Pathogen: selectedPathogens},
    )

    const geojson: any = countriesGeoJson

    let filteredCountriesGeoJson = geojson

    filteredCountriesGeoJson.features = filteredCountriesGeoJson.features.map((country: any) => {
        let properties: any = country.properties

        properties.totalGrants = filteredDataset.filter(grant => grant.ResearchInstitutionCountry === country.properties.ISO_A2).length

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
        .range(["#3b82f6", "#dbeafe"])

    return (
        <Card
            id="grants-by-country-where-research-was-conducted-card"
        >
            <Flex
                flexDirection="col"
                alignItems="start"
                className="gap-y-6"
            >
                <Flex
                    justifyContent="between"
                    alignItems="center"
                >
                    <Title>Grants By Country Where Research Was Conducted</Title>
                    <Text>Total Grants: {dataset.length}</Text>
                </Flex>

                <Flex
                    justifyContent="between"
                    alignItems="center"
                >
                    <PathogenSelect
                        setSelectedPathogens={setSelectedPathogens}
                        className="max-w-xs ignore-in-image-export"
                    />

                    {selectedPathogens.length > 0 &&
                        <Text>Filtered Grants: {filteredDataset.length}</Text>
                    }
                </Flex>

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
            </Flex>


            <Flex
                justifyContent="end"
                alignItems="center"
                className="gap-x-2 ignore-in-image-export"
            >
                <ExportToPngButton
                    selector="#grants-by-country-where-research-was-conducted-card"
                    filename="grants-by-country-where-research-was-conducted"
                />
            </Flex>

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
        </Card>
    )
}
