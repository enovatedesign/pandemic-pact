import {useState} from "react"
import {Flex, BarChart, LineChart, Card, Title, Text, TabGroup, Tab, TabList, Color} from "@tremor/react"
import {PresentationChartBarIcon, PresentationChartLineIcon} from "@heroicons/react/solid"
import {type StringDictionary} from "../../scripts/types/dictionary"
import {millify} from "millify"
import ResearchCategorySelect from "./ResearchCategorySelect"
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {groupBy} from 'lodash'
import {CardProps} from "../types/card-props"

import lookupTables from '../../data/source/lookup-tables.json'
import dataset from '../../data/dist/amount-spent-on-each-research-category-over-time-card.json'

export default function AmountSpentOnEachResearchCategoryOverTimeCard({selectedFilters}: CardProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
    const [selectedResearchCategories, setSelectedResearchCategories] = useState<string[]>([])

    const researchCatLookupTable = lookupTables.ResearchCat as StringDictionary

    const filteredDataset = selectedFilters.funders.length > 0
        ? dataset.filter(grant => selectedFilters.funders.includes(grant.FundingOrgName))
        : dataset

    const datasetGroupedByYear = groupBy(filteredDataset, 'GrantEndYear')

    const researchCategories: string[] = true ? ['All Research Categories'] : Object.values(researchCatLookupTable)

    const amountSpentOnEachResearchCategoryOverTime = Object.keys(
        datasetGroupedByYear
    ).map(year => {
        const grants = datasetGroupedByYear[year]

        let datapoint: {[key: string]: string | number} = {year}

        if (true) {
            datapoint['All Research Categories'] = grants.reduce((sum, grant) => sum + grant.GrantAmountConverted, 0)
        } else {
            researchCategories.forEach(researchCategory => {
                datapoint[researchCategory] = grants
                    .filter(grant => grant.ResearchCat === researchCategory)
                    .reduce((sum, grant) => sum + grant.GrantAmountConverted, 0)
            })
        }

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
                <ResearchCategorySelect
                    setSelectedResearchCategories={setSelectedResearchCategories}
                    className="max-w-xs ignore-in-image-export"
                />

                {filteredDataset.length < dataset.length &&
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

                    <ExportToCsvButton
                        meilisearchRequestBody={exportRequestBodyFilteredToMatchingGrants(filteredDataset)}
                        filename="grant-by-amount-spent-on-each-research-category-over-time"
                    />
                </Flex>
            </Flex>
        </Card>
    )
}
