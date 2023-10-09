import {useState} from 'react'
import {Flex, Card, Title, Text, Tab, TabList, TabGroup, Subtitle} from "@tremor/react"
import {ChartBarIcon, GlobeIcon} from "@heroicons/react/solid"
import Map from "./Map"
import BarChart from "./BarChart"
import MultiSelect from "../MultiSelect"
import ExportToPngButton from "../ExportToPngButton"
import {type CardWithOwnFiltersProps} from "../../types/card-props"
import {filterGrants} from "../../helpers/filter"
import dataset from '../../../data/dist/filterable-dataset.json'
import selectOptions from '../../../data/dist/select-options.json'

export default function GrantsByCountryWhereResearchWasConductedCard({selectedFilters, globallyFilteredDataset}: CardWithOwnFiltersProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
    const [selectedPathogens, setSelectedPathogens] = useState<string[]>([])

    const filteredDataset = filterGrants(
        dataset,
        {...selectedFilters, Pathogen: selectedPathogens},
    )

    return (
        <Card
            className="flex flex-col gap-y-6"
            id="grants-by-country-where-research-was-conducted-card"
        >
            <Flex
                flexDirection="col"
                alignItems="start"
                className="gap-y-6"
            >
                <Flex
                    flexDirection='col'
                    alignItems='start'
                    className='gap-y-2'
                >
                    <Title>Number of Grants by Country Where Research Was Conducted</Title>

                    <Subtitle>
                        Possimus fugit laudantium recusandae.
                        Ducimus rem minima quam consequatur asperiores magni.
                        Earum a illum.
                    </Subtitle>
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

                    {filteredDataset.length < globallyFilteredDataset.length &&
                        <Text>Filtered Grants: {filteredDataset.length}</Text>
                    }
                </Flex>

                {selectedTabIndex === 0 &&
                    <Map
                        dataset={filteredDataset}
                    />
                }

                {selectedTabIndex === 1 &&
                    <BarChart
                        dataset={filteredDataset}
                        selectedPathogens={selectedPathogens}
                    />
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
                    className="w-auto"
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

            <p className="text-sm text-gray-500">Please note that only a subset of the full dataset is represented in charts related to committed amounts of money.</p>
        </Card >
    )
}
