import {useState} from "react"
import {Flex, BarChart, Text, Color, Subtitle} from "@tremor/react"
import VisualisationCard from "./VisualisationCard"
import {filterGrants} from "../helpers/filter"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import {dollarValueFormatter} from "../helpers/value-formatters"
import {groupBy} from 'lodash'
import {CardWithOwnFiltersProps} from "../types/card-props"
import MultiSelect from "./MultiSelect"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'

export default function FundingAmountsforEachResearchCategoryOverTime({selectedFilters, globallyFilteredDataset}: CardWithOwnFiltersProps) {
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
        <VisualisationCard
            filteredDataset={filteredDataset}
            id="amount-committed-to-each-research-category-over-time-card"
            title="Funding Amounts for Each Research Category Over Time"
            subtitle="Ipsam vero quae beatae quas nemo quae necessitatibus commodi. Fuga laboriosam possimus corrupti dolore eveniet maiores. Porro laboriosam laboriosam assumenda esse porro placeat voluptatum."
            footnote="Please note that grants may fall under more than one Research Category, and Funding Amounts are included only when they have been published by the funder."
        >
            <div className="flex flex-col gap-y-6 w-full">
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

                    {filteredDataset.length < globallyFilteredDataset.length &&
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
            </div>
        </VisualisationCard>
    )
}
