import {useState} from "react"
import {Flex, BarChart, LineChart, Card, Title, Text, TabGroup, Tab, TabList, Color} from "@tremor/react"
import {PresentationChartBarIcon, PresentationChartLineIcon} from "@heroicons/react/solid"
import {millify} from "millify"
import ResearchCategorySelect from "./ResearchCategorySelect"
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {filterGrants} from "../helpers/filter"
import {groupBy} from 'lodash'
import {CardProps} from "../types/card-props"
import dataset from '../../data/dist/amount-committed-to-each-research-category-over-time-card.json'
import researchCategoryOptions from '../../data/dist/select-options/ResearchCat.json'

export default function AmountCommittedToEachResearchCategoryOverTimeCard({selectedFilters}: CardProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
    const [selectedResearchCategories, setSelectedResearchCategories] = useState<string[]>([])

    const filteredDataset = filterGrants(
        dataset,
        {...selectedFilters, ResearchCat: selectedResearchCategories},
    )

    const datasetGroupedByYear = groupBy(filteredDataset, 'GrantStartYear')

    const selectedResearchCategoryOptions: {value: string, label: string}[] = selectedResearchCategories.length === 0 ?
        [{value: 'All Research Categories', label: 'All Research Categories'}] :
        researchCategoryOptions.filter(
            researchCategory => selectedResearchCategories.includes(researchCategory.value)
        )

    const amountCommittedToEachResearchCategoryOverTime = Object.keys(
        datasetGroupedByYear
    ).map(year => {
        const grants = datasetGroupedByYear[year]

        let dataPoint: {[key: string]: string | number} = {year}

        if (selectedResearchCategories.length === 0) {
            dataPoint['All Research Categories'] = grants.reduce((sum, grant) => sum + grant.GrantAmountConverted, 0)
        } else {
            selectedResearchCategoryOptions.forEach(selectedResearchCategoryOption => {
                dataPoint[selectedResearchCategoryOption.label] = grants
                    .filter(grant => grant.ResearchCat.includes(selectedResearchCategoryOption.value))
                    .reduce((sum, grant) => sum + grant.GrantAmountConverted, 0)
            })
        }

        return dataPoint
    })

    const colours: Color[] = [
        'blue',
        'lime',
        'cyan',
        'violet',
        'orange',
        'emerald',
        'indigo',
        'purple',
        'amber',
        'green',
        'red',
        'fuchsia',
        'yellow',
        'neutral',
    ]

    const valueFormatter = (value: number) => {
        return '$' + millify(value, {precision: 2})
    }

    const researchCategories = selectedResearchCategoryOptions.map(selectedResearchCategoryOption => selectedResearchCategoryOption.label)

    return (
        <Card
            className="flex flex-col gap-y-6"
            id="amount-committed-to-each-research-category-over-time-card"
        >
            <Flex
                justifyContent="between"
                alignItems="center"
            >
                <Title>Amount Committed To Each Research Category Over Time</Title>
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
                <LineChart
                    data={amountCommittedToEachResearchCategoryOverTime}
                    index="year"
                    categories={researchCategories}
                    valueFormatter={valueFormatter}
                    colors={colours}
                    showLegend={false}
                    className="h-[36rem] -ml-2"
                />
            }

            {selectedTabIndex === 1 &&
                <BarChart
                    data={amountCommittedToEachResearchCategoryOverTime}
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
                        <Tab icon={PresentationChartLineIcon}>Line</Tab>
                        <Tab icon={PresentationChartBarIcon}>Bar</Tab>
                    </TabList>
                </TabGroup>

                <Flex
                    justifyContent="end"
                    alignItems="center"
                    className="gap-x-2"
                >
                    <ExportToPngButton
                        selector="#amount-committed-to-each-research-category-over-time-card"
                        filename="amount-committed-to-each-research-category-over-time"
                    />

                    <ExportToCsvButton
                        meilisearchRequestBody={exportRequestBodyFilteredToMatchingGrants(filteredDataset)}
                        filename="grant-by-amount-committed-to-each-research-category-over-time"
                    />
                </Flex>
            </Flex>

            <p className="text-sm text-gray-500">*Please note that only a subset of the full dataset is represented in charts related to committed amounts of money.</p>
        </Card>
    )
}