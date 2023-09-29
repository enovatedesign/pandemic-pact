import {Flex, Card, Title, Subtitle, Text, DonutChart} from "@tremor/react"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'

export default function GrantsByResearchCategoryCard({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)

    const regionOptions = selectOptions.Regions

    const numberOfGrantsPerRegion = regionOptions.map(function (regionOption) {
        const numberOfGrants = filteredDataset
            .filter((grant: any) => grant.GrantRegion === regionOption.label)
            .length

        return {
            region: regionOption.label,
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
                    className="gap-y-2"
                    flexDirection="col"
                    alignItems="start"
                >
                    <Flex
                        justifyContent="between"
                        alignItems="center"
                    >
                        <Title>Grants By Region</Title>
                        <Text>Total Grants: {dataset.length}</Text>
                    </Flex>

                    <Subtitle>
                        Ut cumque vel magni nostrum quo id quasi aliquam.
                        Soluta voluptate ea nesciunt ipsam. Occaecati ex aperiam ut omnis.
                    </Subtitle>
                </Flex>

                <Flex
                    justifyContent="end"
                    alignItems="center"
                >
                    {filteredDataset.length < dataset.length &&
                        <Text>Filtered Grants: {filteredDataset.length}</Text>
                    }
                </Flex>

                <DonutChart
                    className="-ml-2 h-80"
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
