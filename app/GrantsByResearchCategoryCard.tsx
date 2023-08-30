import {useState} from "react"
import {Flex, Button, BarList, Card, Title, Subtitle, List, ListItem, Grid, Col, MultiSelect, MultiSelectItem, Text, Tab, TabList, TabGroup, ScatterChart, Color} from "@tremor/react"
import {DownloadIcon, ChartBarIcon, SparklesIcon} from "@heroicons/react/solid"
import {type StringDictionary} from "../scripts/types/dictionary"
import {millify} from "millify"
import meilisearchRequest from './helpers/meilisearch-request'
import exportToCsv from "./helpers/export-to-csv"

import funders from '../data/source/funders.json'
import lookupTables from '../data/source/lookup-tables.json'
import dataset from '../data/dist/grants-by-research-category-card.json'

export default function GrantsByResearchCategoryCard() {
    const [selectedFunders, setSelectedFunders] = useState<string[]>([])
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
    const [exportingResults, setExportingResults] = useState<boolean>(false)

    const researchCatLookupTable = lookupTables.ResearchCat as StringDictionary

    const researchCategories: {value: string, name: string}[] = Object.keys(researchCatLookupTable).map((key: string) => ({
        value: key,
        name: researchCatLookupTable[key],
    }))

    const filteredDataset = selectedFunders.length > 0
        ? dataset.filter(grant => selectedFunders.includes(grant.FundingOrgName))
        : dataset

    const numberOfGrantsPerResearchCategory = researchCategories.map(function (researchCategory) {
        const value = filteredDataset
            .filter(grant => grant.ResearchCat === researchCategory.name)
            .length

        return {
            key: `grants-per-category-${researchCategory.value}`,
            value: value,
            name: '',
        }
    })

    const amountOfMoneySpentPerResearchCategory = researchCategories.map(function (researchCategory) {
        const value = filteredDataset
            .filter(grant => grant.ResearchCat === researchCategory.name)
            .reduce((sum, grant) => sum + grant.GrantAmountConverted, 0)

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

    const exportResults = () => {
        setExportingResults(true)

        const body = {
            filter: `GrantID IN [${filteredDataset.map(grant => grant.GrantID).join(',')}]`,
            sort: ['GrantID:asc'],
            limit: 100_000, // TODO determine this based on number of generated grants in complete dataset?
        }

        meilisearchRequest('exports', body).then(data => {
            exportToCsv('pandemic-pact-grants-by-research-category-export', data.hits)
            setExportingResults(false)
        }).catch((error) => {
            console.error('Error:', error)
            setExportingResults(false)
        })
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
                    <Title>Grants By Research Category</Title>
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

                    <Button
                        icon={DownloadIcon}
                        loading={exportingResults}
                        disabled={exportingResults}
                        onClick={exportResults}
                    >
                        Export Results To CSV
                    </Button>
                </Flex>
            </Flex>
        </Card>
    )
}
