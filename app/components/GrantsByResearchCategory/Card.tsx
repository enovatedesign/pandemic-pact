import {useState} from "react"
import {Flex, BarList, Card, Title, Subtitle, List, ListItem, Grid, Col, Text, Tab, TabList, TabGroup, ScatterChart, Color} from "@tremor/react"
import {ChartBarIcon, SparklesIcon} from "@heroicons/react/solid"
import ExportToPngButton from "../ExportToPngButton"
import ExportToCsvButton from "../ExportToCsvButton"
import BarChart from "./BarChart"
import {exportRequestBodyFilteredToMatchingGrants} from "../../helpers/meilisearch"
import {type CardProps} from "../../types/card-props"
import {filterGrants} from "../../helpers/filter"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {dollarValueFormatter} from "../../helpers/value-formatters"
import dataset from "../../../data/dist/filterable-dataset.json"
import selectOptions from "../../../data/dist/select-options.json"

export default function GrantsByResearchCategoryCard({selectedFilters}: CardProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)

    const filteredDataset = filterGrants(dataset, selectedFilters)

    const researchCategoryOptions = selectOptions.ResearchCat

    const numberOfGrantsPerResearchCategory = researchCategoryOptions.map(function (researchCategory) {
        const value = filteredDataset
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .length

        return {
            key: `grants-per-category-${researchCategory.value}`,
            value: value,
            name: '',
        }
    })

    const amountOfMoneyCommittedPerResearchCategory = researchCategoryOptions.map(function (researchCategory) {
        const value = filteredDataset
            .filter((grant: any) => grant.ResearchCat.includes(researchCategory.value))
            .reduce(...sumNumericGrantAmounts)

        return {
            key: `grant-amount-${researchCategory.value}`,
            value: value,
            name: '',
        }
    })

    const scatterChartData = researchCategoryOptions.map(function (researchCategory, index) {
        const numberOfGrants = numberOfGrantsPerResearchCategory[index].value;
        const moneyCommitted = amountOfMoneyCommittedPerResearchCategory[index].value;

        return {
            "Research Category": researchCategory.label,
            "Number Of Grants": numberOfGrants,
            "Amount Committed": moneyCommitted,
        }
    })

    const colours: Color[] = [
        'red',
        'lime',
        'cyan',
        'violet',
        'orange',
        'emerald',
        'indigo',
        'purple',
        'amber',
        'green',
        'blue',
        'fuchsia',
        'yellow',
        'neutral',
    ]

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
                    justifyContent="between"
                    alignItems="center"
                >
                    <Title>Grants By Research Category</Title>
                    <Text>Total Grants: {dataset.length}</Text>
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
                        selectedFilters={selectedFilters}
                    />
                }

                {selectedTabIndex === 1 &&
                    <ScatterChart
                        className="h-80 -ml-2"
                        data={scatterChartData}
                        category="Research Category"
                        x="Number Of Grants"
                        y="Amount Committed"
                        showOpacity={true}
                        minYValue={60}
                        valueFormatter={{
                            x: (value: number) => `${value} grants`,
                            y: dollarValueFormatter,
                        }}
                        showLegend={false}
                        autoMinXValue
                        autoMinYValue
                        colors={colours}
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
