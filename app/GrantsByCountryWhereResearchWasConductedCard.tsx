import {useState} from 'react'
import {Flex, Card, Title, Text, MultiSelect, MultiSelectItem} from "@tremor/react"
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {Tooltip} from 'react-tooltip'
import {scaleLinear} from "d3-scale"

import dataset from '../data/dist/grants-by-country-of-research-card.json'
import countriesGeoJson from '../data/source/geojson/countries.json'
import lookupTables from '../data/source/lookup-tables.json'

export default function GrantsByCountryWhereResearchWasConducted() {
    const [tooltipContent, setTooltipContent] = useState('')
    const [selectedPathogens, setSelectedPathogens] = useState<string[]>([])

    const pathogens = Object.values(lookupTables.Pathogens)

    const filteredDataset = selectedPathogens.length > 0
        ? dataset.filter(grant => selectedPathogens.includes(grant.Pathogen))
        : dataset

    const filteredCountriesGeoJson = countriesGeoJson.features.map(country => {
        let properties = country.properties

        properties.totalGrants = filteredDataset.filter(grant => grant.ResearchInstitutionCountry === country.properties.ISO_A2).length

        country.properties = properties

        return country
    })

    const allTotalGrants = filteredCountriesGeoJson
        .filter(country => country.properties.totalGrants)
        .map(country => country.properties.totalGrants)

    const colorScale = scaleLinear()
        .domain([
            Math.min(...allTotalGrants),
            Math.max(...allTotalGrants),
        ])
        .range(["#3b82f6", "#dbeafe"])

    return (
        <Card>
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
                    <MultiSelect
                        value={selectedPathogens}
                        onValueChange={setSelectedPathogens}
                        placeholder="Select pathogens..."
                        className="max-w-xs"
                    >
                        {pathogens.map((pathogenName) => (
                            <MultiSelectItem key={pathogenName} value={pathogenName}>
                                {pathogenName}
                            </MultiSelectItem>
                        ))}
                    </MultiSelect>

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
                    <Geographies geography={countriesGeoJson}>
                        {({geographies}) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={geo.properties.totalGrants ? colorScale(geo.properties.totalGrants) : "#D6D6DA"}
                                    stroke="#FFFFFF"
                                    strokeWidth={1}
                                    onMouseEnter={() => {
                                        setTooltipContent(geo.properties.NAME)
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

            <Tooltip
                id="country-tooltip"
                float={true}
                isOpen={tooltipContent !== ''}
            >
                {tooltipContent}
            </Tooltip>
        </Card>
    )
}
