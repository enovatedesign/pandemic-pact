import {useState} from 'react'
import {Flex, Card, Title, Text, Tab, TabList, TabGroup} from "@tremor/react"
import {Switch} from '@headlessui/react'
import {ChartBarIcon, GlobeIcon} from "@heroicons/react/solid"
import Map from "./Map"
import BarChart from "./BarChart"
import MultiSelect from "../MultiSelect"
import ExportToPngButton from "../ExportToPngButton"
import {type CardProps} from "../../types/card-props"
import {filterGrants} from "../../helpers/filter"
import dataset from '../../../data/dist/filterable-dataset.json'
import selectOptions from '../../../data/dist/select-options.json'

export default function GrantsByCountryWhereResearchWasConductedCard({selectedFilters}: CardProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
    const [selectedPathogens, setSelectedPathogens] = useState<string[]>([])
    const [displayWhoRegions, setDisplayWhoRegions] = useState<boolean>(false)

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
                    <Map
                        dataset={filteredDataset}
                        displayWhoRegions={displayWhoRegions}
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

                <div className="flex items-center gap-x-2">
                    <Text className={opaqueTextIf(!displayWhoRegions)}>Countries</Text>

                    <Switch
                        checked={displayWhoRegions}
                        onChange={setDisplayWhoRegions}
                        className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full"
                    >
                        <span className="sr-only">Display WHO Regions</span>

                        <span
                            className={`${displayWhoRegions ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                    </Switch>

                    <Text className={opaqueTextIf(displayWhoRegions)}>WHO Regions</Text>
                </div>

                <ExportToPngButton
                    selector="#grants-by-country-where-research-was-conducted-card"
                    filename="grants-by-country-where-research-was-conducted"
                />
            </Flex>

            <p className="text-sm text-gray-500">*Please note that only a subset of the full dataset is represented in charts related to committed amounts of money.</p>
        </Card >
    )
}

function opaqueTextIf(condition: boolean) {
    return condition ? 'opacity-100 text-black' : 'opacity-75'
}
