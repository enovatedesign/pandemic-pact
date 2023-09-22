import {useState} from 'react'
import {Flex, Card, Title, Text, Tab, TabList, TabGroup} from "@tremor/react"
import {ChartBarIcon, GlobeIcon} from "@heroicons/react/solid"
import {ComposableMap, Geographies, Geography} from 'react-simple-maps'
import {Tooltip} from 'react-tooltip'
import {scaleLinear} from "d3-scale"
import MultiSelect from "./MultiSelect"
import ExportToPngButton from "./ExportToPngButton"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'
import countriesGeoJson from '../../data/source/geojson/ne_110m_admin_0_countries.json'

export default function GrantsByCountryWhereResearchWasConducted({selectedFilters}: CardProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
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

        properties.totalGrants = filteredDataset.filter((grant: any) => grant.ResearchInstitutionCountry === country.properties.ISO_A2).length

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
                    <MultiSelect
                        options={selectOptions.Pathogen}
                        selectedOptions={selectedPathogens}
                        setSelectedOptions={setSelectedPathogens}
                        placeholder="All Pathogens"
                        className="max-w-xs ignore-in-image-export"
                    />

                    {filteredDataset.length < dataset.length &&
                        <Text>Filtered Grants: {filteredDataset.length}</Text>
                    }
                </Flex>

                {selectedTabIndex === 0 &&
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
                }

                {selectedTabIndex === 1 &&
                    <div>TODO</div>
                }
            </Flex>

            <Flex
                justifyContent="between"
                alignItems="center"
                className="gap-x-2 ignore-in-image-export"
            >
                <TabGroup
                    index={selectedTabIndex}
                    onIndexChange={setSelectedTabIndex}
                >
                    <TabList variant="solid">
                        <Tab icon={GlobeIcon}>Map</Tab>
                        <Tab icon={ChartBarIcon}>Bars</Tab>
                    </TabList>
                </TabGroup>

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
