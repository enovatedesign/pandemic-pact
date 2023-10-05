import {useState} from "react"
import {Flex, BarChart, Card, Title, Text, Color, Subtitle} from "@tremor/react"
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {filterGrants} from "../helpers/filter"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import {dollarValueFormatter} from "../helpers/value-formatters"
import {groupBy} from 'lodash'
import {CardProps} from "../types/card-props"
import MultiSelect from "./MultiSelect"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'

export default function FundingAmountsforEachResearchCategoryOverTime({selectedFilters}: CardProps) {
    const [selectedResearchCategories, setSelectedResearchCategories] = useState<string[]>([])

    const filteredDataset = filterGrants(
        dataset,
        {...selectedFilters, ResearchCat: selectedResearchCategories},
    )

    const datasetGroupedByYear = groupBy(
        filteredDataset.filter((grants: any) => grants.GrantStartYear?.match(/^\d{4}$/)),
        'GrantStartYear',
    )

    const researchCategoryOptions = selectOptions.ResearchCat

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
            dataPoint['All Research Categories'] = grants.reduce(...sumNumericGrantAmounts)
        } else {
            selectedResearchCategoryOptions.forEach(selectedResearchCategoryOption => {
                dataPoint[selectedResearchCategoryOption.label] = grants
                    .filter(grant => grant.ResearchCat.includes(selectedResearchCategoryOption.value))
                    .reduce(...sumNumericGrantAmounts)
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
                <Title>Funding Amounts for Each Research Category Over Time</Title>
                <Text>Total Grants: {dataset.length}</Text>
            </Flex>

            <Flex
                justifyContent="between"
                alignItems="center"
                className="ignore-in-image-export"
            >
                <MultiSelect
                    options={selectOptions.ResearchCat}
                    selectedOptions={selectedResearchCategories}
                    setSelectedOptions={setSelectedResearchCategories}
                    placeholder="All Research Categories"
                    className="max-w-xs ignore-in-image-export"
                />

                {filteredDataset.length < dataset.length &&
                    <Text>Filtered Grants: {filteredDataset.length}</Text>
                }
            </Flex>

            <Flex
                flexDirection="row"
            >
                <div className="w-16">
                    <Subtitle className="absolute whitespace-nowrap -rotate-90 -translate-x-1/3">Amount Committed (USD)</Subtitle>
                </div>

                <Flex
                    flexDirection="col"
                    className="gap-y-2"
                >
                    <BarChart
                        data={amountCommittedToEachResearchCategoryOverTime}
                        index="year"
                        categories={researchCategories}
                        valueFormatter={dollarValueFormatter}
                        colors={colours}
                        showLegend={false}
                        className="h-[36rem] -ml-2"
                    />

                    <Subtitle>Year</Subtitle>
                </Flex>
            </Flex>

            <Flex
                justifyContent="between"
                alignItems="center"
                className="ignore-in-image-export"
            >
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
