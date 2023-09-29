import {useState} from "react"
import {Flex, Card, Title, Subtitle, Text, Tab, TabList, TabGroup} from "@tremor/react"
import {ChartBarIcon, SparklesIcon} from "@heroicons/react/solid"
import ExportToPngButton from "../ExportToPngButton"
import ExportToCsvButton from "../ExportToCsvButton"
import BarChart from "./BarChart"
import ScatterChart from "./ScatterChart"
import {exportRequestBodyFilteredToMatchingGrants} from "../../helpers/meilisearch"
import {type CardProps} from "../../types/card-props"
import {filterGrants} from "../../helpers/filter"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import dataset from "../../../data/dist/filterable-dataset.json"
import selectOptions from "../../../data/dist/select-options.json"

export default function GrantsByResearchCategoryCard({selectedFilters}: CardProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)

    const filteredDataset = filterGrants(dataset, selectedFilters)

    const researchCategoryOptions = selectOptions.ResearchCat

    const chartData = researchCategoryOptions.map(function (researchCategory) {
        const grantsWithKnownAmounts = filteredDataset
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted === "number")

        const grantsWithUnspecifiedAmounts = filteredDataset
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted !== "number")

        const moneyCommitted = grantsWithKnownAmounts.reduce(...sumNumericGrantAmounts)

        return {
            "Research Category": researchCategory.label,
            "Number Of Grants With Known Amount Committed": grantsWithKnownAmounts.length,
            "Number Of Grants With Unspecified Amount Committed": grantsWithUnspecifiedAmounts.length,
            "Total Number Of Grants": grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
            "Amount Committed": moneyCommitted,
        }
    })

    return (
        <Card
            id="grants-by-research-category-card"
        >
            <Flex
                flexDirection="col"
                alignItems="start"
                className="gap-y-6"
            >
                <Flex
                    flexDirection="col"
                    alignItems="start"
                    className="gap-y-2"
                >
                    <Flex
                        justifyContent="between"
                        alignItems="center"
                    >
                        <Title>Grants By Research Category</Title>
                        <Text>Total Grants: {dataset.length}</Text>
                    </Flex>

                    <Subtitle>
                        Magni reprehenderit architecto eligendi id sint repudiandae dolore aperiam.
                        Tenetur sint nemo hic iusto. A corporis aliquam magni nemo harum iusto.
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

                {selectedTabIndex === 0 &&
                    <BarChart
                        chartData={chartData}
                    />
                }

                {selectedTabIndex === 1 &&
                    <ScatterChart
                        chartData={chartData}
                    />
                }

                <Flex
                    justifyContent="between"
                    alignItems="center"
                    className="ignore-in-image-export"
                >
                    <TabGroup
                        index={selectedTabIndex}
                        onIndexChange={setSelectedTabIndex}
                    >
                        <TabList variant="solid">
                            <Tab icon={ChartBarIcon}>Bars</Tab>
                            <Tab icon={SparklesIcon}>Scatter</Tab>
                        </TabList>
                    </TabGroup>

                    <Flex
                        justifyContent="end"
                        alignItems="center"
                        className="gap-x-2"
                    >
                        <ExportToPngButton
                            selector="#grants-by-research-category-card"
                            filename="grants-by-research-category"
                        />

                        <ExportToCsvButton
                            meilisearchRequestBody={exportRequestBodyFilteredToMatchingGrants(filteredDataset)}
                            filename="grant-by-research-category"
                        />
                    </Flex>
                </Flex>

                <p className="text-sm text-gray-500">*Please note that only a subset of the full dataset is represented in charts related to committed amounts of money.</p>
            </Flex>
        </Card>
    )
}
