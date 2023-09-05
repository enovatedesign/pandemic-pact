import {Flex, Card, Title, Text, DonutChart} from "@tremor/react"
import {type StringDictionary} from "../../scripts/types/dictionary"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"

import lookupTables from '../../data/source/lookup-tables.json'
import dataset from '../../data/dist/grants-by-region-card.json'

export default function GrantsByResearchCategoryCard({selectedFilters}: CardProps) {
    const regionsLookupTable = lookupTables.Regions as StringDictionary

    const regions: {value: string, name: string}[] = Object.keys(regionsLookupTable).map((key: string) => ({
        value: key,
        name: regionsLookupTable[key],
    }))

    const filteredDataset = filterGrants(dataset, selectedFilters)

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
                    justifyContent="end"
                    alignItems="center"
                >
                    {selectedFilters.funders.length > 0 &&
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
