import {useState} from "react"
import {Flex, Button, BarChart, LineChart, Card, Title, MultiSelect, MultiSelectItem, Text, TabGroup, Tab, TabList, Color} from "@tremor/react"
import {DownloadIcon, PresentationChartBarIcon, PresentationChartLineIcon} from "@heroicons/react/solid"
import {type StringDictionary} from "../../scripts/types/dictionary"
import {millify} from "millify"
import meilisearchRequest from '../helpers/meilisearch-request'
import exportToCsv from "../helpers/export-to-csv"
import {groupBy} from 'lodash'
import ExportToPngButton from "./ExportToPngButton"

import funders from '../../data/source/funders.json'
import lookupTables from '../../data/source/lookup-tables.json'
import dataset from '../../data/dist/amount-spent-on-each-research-category-over-time-card.json'

export default function AmountSpentOnEachResearchCategoryOverTimeCard() {
    const [selectedFunders, setSelectedFunders] = useState<string[]>([])
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
    const [exportingResults, setExportingResults] = useState<boolean>(false)

    const researchCatLookupTable = lookupTables.ResearchCat as StringDictionary

    const researchCategories: string[] = Object.values(researchCatLookupTable)

    const filteredDataset = selectedFunders.length > 0
        ? dataset.filter(grant => selectedFunders.includes(grant.FundingOrgName))
        : dataset

    const datasetGroupedByYear = groupBy(filteredDataset, 'GrantEndYear')

    const amountSpentOnEachResearchCategoryOverTime = Object.keys(
        datasetGroupedByYear
    ).map(year => {
        const grants = datasetGroupedByYear[year]

        let datapoint: {[key: string]: string | number} = {year}

        researchCategories.forEach(researchCategory => {
            datapoint[researchCategory] = grants
                .filter(grant => grant.ResearchCat === researchCategory)
                .reduce((sum, grant) => sum + grant.GrantAmountConverted, 0)
        })

        return datapoint
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

    const valueFormatter = (value: number) => {
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

    return (
        <Card
            className="flex flex-col gap-y-6"
            id="amount-spent-on-each-research-category-over-time-card"
        >
            <Flex
                justifyContent="between"
                alignItems="center"
            >
                <Title>Amount Spent On Each Research Category Over Time</Title>
                <Text>Total Grants: {dataset.length}</Text>
            </Flex>

            <Flex
                justifyContent="between"
                alignItems="center"
                className="ignore-in-image-export"
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
                <BarChart
                    data={amountSpentOnEachResearchCategoryOverTime}
                    index="year"
                    categories={researchCategories}
                    valueFormatter={valueFormatter}
                    colors={colours}
                    showLegend={false}
                    className="h-[36rem] -ml-2"
                />
            }

            {selectedTabIndex === 1 &&
                <LineChart
                    data={amountSpentOnEachResearchCategoryOverTime}
                    index="year"
                    categories={researchCategories}
                    valueFormatter={valueFormatter}
                    colors={colours}
                    showLegend={false}
                    className="h-[36rem] -ml-2"
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
                        <Tab icon={PresentationChartBarIcon}>Bar</Tab>
                        <Tab icon={PresentationChartLineIcon}>Line</Tab>
                    </TabList>
                </TabGroup>

                <Flex
                    justifyContent="end"
                    alignItems="center"
                    className="gap-x-2"
                >
                    <ExportToPngButton
                        selector="#amount-spent-on-each-research-category-over-time-card"
                        filename="amount-spent-on-each-research-category-over-time"
                    />

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
