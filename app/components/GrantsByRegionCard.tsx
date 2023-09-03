import {useState} from "react"
import {Flex, Button, Card, Title, MultiSelect, MultiSelectItem, Text, DonutChart} from "@tremor/react"
import {DownloadIcon} from "@heroicons/react/solid"
import {type StringDictionary} from "../../scripts/types/dictionary"
import {meilisearchRequest} from "../helpers/meilisearch"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"

import funders from '../../data/source/funders.json'
import lookupTables from '../../data/source/lookup-tables.json'
import dataset from '../../data/dist/grants-by-region-card.json'

export default function GrantsByResearchCategoryCard() {
    const [selectedFunders, setSelectedFunders] = useState<string[]>([])

    const regionsLookupTable = lookupTables.Regions as StringDictionary

    const regions: {value: string, name: string}[] = Object.keys(regionsLookupTable).map((key: string) => ({
        value: key,
        name: regionsLookupTable[key],
    }))

    const filteredDataset = selectedFunders.length > 0
        ? dataset.filter(grant => selectedFunders.includes(grant.FundingOrgName))
        : dataset

    const numberOfGrantsPerRegion = regions.map(function (region) {
        const numberOfGrants = filteredDataset
            .filter(grant => grant.GrantRegion === region.name)
            .length

        return {
            region: region.name,
            numberOfGrants: numberOfGrants,
        }
    })

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
                    <Title>Grants By Region</Title>
                    <Text>Total Grants: {dataset.length}</Text>
                </Flex>

                <Flex
                    justifyContent="between"
                    alignItems="center"
                >
                    <MultiSelect
                        value={selectedFunders}
                        onValueChange={setSelectedFunders}
                        placeholder="Select funders..."
                        className="max-w-xs"
                    >
                        {funders.map((funderName) => (
                            <MultiSelectItem key={funderName} value={funderName}>
                                {funderName}
                            </MultiSelectItem>
                        ))}
                    </MultiSelect>

                    {selectedFunders.length > 0 &&
                        <Text>Filtered Grants: {filteredDataset.length}</Text>
                    }
                </Flex>

                <DonutChart
                    className="h-80 -ml-2"
                    data={numberOfGrantsPerRegion}
                    index="region"
                    category="numberOfGrants"
                    variant="pie"
                />

                <Flex
                    justifyContent="end"
                >
                    <ExportToCsvButton
                        meilisearchRequestBody={exportRequestBodyFilteredToMatchingGrants(filteredDataset)}
                        filename="grant-by-region"
                    />
                </Flex>
            </Flex>
        </Card>
    )
}
