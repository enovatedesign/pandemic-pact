import {useState} from "react"
import {Flex, BarList, Card, Title, Subtitle, List, ListItem, Grid, Col, Text, Tab, TabList, TabGroup, ScatterChart, Color} from "@tremor/react"
import {ChartBarIcon, SparklesIcon} from "@heroicons/react/solid"
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type StringDictionary} from "../../scripts/types/dictionary"
import {millify} from "millify"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"

import lookupTables from '../../data/source/lookup-tables.json'
import dataset from '../../data/dist/grants-by-research-category-card.json'

export default function GrantsByResearchCategoryCard({selectedFilters}: CardProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)

    const researchCatLookupTable = lookupTables.ResearchCat as StringDictionary

    const researchCategories: {value: string, name: string}[] = Object.keys(researchCatLookupTable).map((key: string) => ({
        value: key,
        name: researchCatLookupTable[key],
    }))

    const filteredDataset = filterGrants(dataset, selectedFilters)

    const numberOfGrantsPerResearchCategory = researchCategories.map(function (researchCategory) {
        const value = filteredDataset
            .filter((grant: any) => grant.ResearchCat === researchCategory.name)
            .length

        return {
            key: `grants-per-category-${researchCategory.value}`,
            value: value,
            name: '',
        }
    })

    const amountOfMoneySpentPerResearchCategory = researchCategories.map(function (researchCategory) {
        const value = filteredDataset
            .filter((grant: any) => grant.ResearchCat === researchCategory.name)
            .reduce((sum: any, grant: any) => sum + grant.GrantAmountConverted, 0)

        return {
            key: `grant-amount-${researchCategory.value}`,
            value: value,
            name: '',
        }
    })

    const scatterChartData = researchCategories.map(function (researchCategory, index) {
        const numberOfGrants = numberOfGrantsPerResearchCategory[index].value;
        const moneySpent = amountOfMoneySpentPerResearchCategory[index].value;

        return {
            "Research Category": researchCategory.name,
            "Number Of Grants": numberOfGrants,
            "Money Spent": moneySpent,
        }
    })

    const amountOfMoneySpentPerResearchCategoryValueFormatter = (value: number) => {
        return '$' + millify(value, {precision: 2})
    }

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
                    {selectedFilters.FundingOrgName.length > 0 &&
                        <Text>Filtered Grants: {filteredDataset.length}</Text>
                    }
                </Flex>

                {selectedTabIndex === 0 &&
                    <Grid
                        className="gap-12"
                        numItems={3}
                    >
                        <Col>
                            <List>
                                {researchCategories.map((item) => (
                                    <ListItem
                                        key={item.value}
                                        className="h-9 mb-2 border-none justify-start"
                                    >
                                        <span className="min-w-[2rem]">{item.value}</span>
                                        <span className="truncate">{item.name}</span>
                                    </ListItem>
                                ))}
                            </List>
                        </Col>

                        <Col>
                            <BarList
                                data={numberOfGrantsPerResearchCategory}
                            />

                            <Subtitle className="mt-4 text-right">Number of projects</Subtitle>
                        </Col>

                        <Col>
                            <BarList
                                data={amountOfMoneySpentPerResearchCategory}
                                valueFormatter={amountOfMoneySpentPerResearchCategoryValueFormatter}
                            />

                            <Subtitle className="mt-4 text-right">Known value of projects (USD)</Subtitle>
                        </Col>
                    </Grid>
                }

                {selectedTabIndex === 1 &&
                    <ScatterChart
                        className="h-80 -ml-2"
                        data={scatterChartData}
                        category="Research Category"
                        x="Number Of Grants"
                        y="Money Spent"
                        showOpacity={true}
                        minYValue={60}
                        valueFormatter={{
                            x: (value: number) => `${value} grants`,
                            y: amountOfMoneySpentPerResearchCategoryValueFormatter,
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
            </Flex>
        </Card>
    )
}
