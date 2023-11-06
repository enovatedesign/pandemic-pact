import {useState} from "react"
import {Flex, BarChart as TremorBarChart, LineChart as TremorLineChart, Text, Color, Subtitle} from "@tremor/react"
import {PresentationChartBarIcon, PresentationChartLineIcon} from "@heroicons/react/solid"
import VisualisationCard from "./VisualisationCard"
import MultiSelect from "./MultiSelect"
import {filterGrants} from "../helpers/filter"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import {dollarValueFormatter} from "../helpers/value-formatters"
import {groupBy} from 'lodash'
import {CardWithOwnFiltersProps} from "../types/card-props"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'

export default function FundingAmountsforEachResearchCategoryOverTimeCard({selectedFilters, globallyFilteredDataset}: CardWithOwnFiltersProps) {
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

    const tabs = [
        {
            tab: {
                icon: PresentationChartLineIcon,
                label: "Lines",
            },
            content: <LineChart data={amountCommittedToEachResearchCategoryOverTime} categories={researchCategories} colours={colours} />,
        },
        {
            tab: {
                icon: PresentationChartBarIcon,
                label: "Bar",
            },
            content: <BarChart data={amountCommittedToEachResearchCategoryOverTime} categories={researchCategories} colours={colours} />,
        },
    ]

    return (
        <VisualisationCard
            filteredDataset={filteredDataset}
            id="amount-committed-to-each-research-category-over-time-card"
            title="Funding Amounts for Each Research Category Over Time"
            subtitle="Ipsam vero quae beatae quas nemo quae necessitatibus commodi. Fuga laboriosam possimus corrupti dolore eveniet maiores. Porro laboriosam laboriosam assumenda esse porro placeat voluptatum."
            footnote="Please note that grants may fall under more than one Research Category, and Funding Amounts are included only when they have been published by the funder."
            tabs={tabs}
        >
            <Flex
                justifyContent="between"
                alignItems="center"
                className="ignore-in-image-export mb-6"
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
        </VisualisationCard>
    )
}

interface ChartProps {
    data: any[],
    categories: string[],
    colours: Color[],
}

function BarChart({data, categories, colours}: ChartProps) {
    return (
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
                <TremorBarChart
                    data={data}
                    index="year"
                    categories={categories}
                    valueFormatter={dollarValueFormatter}
                    colors={colours}
                    showLegend={false}
                    className="h-[36rem] -ml-2"
                />

                <Subtitle>Year</Subtitle>
            </Flex>
        </Flex>
    )
}

function LineChart({data, categories, colours}: ChartProps) {
    return (
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
                <TremorLineChart
                    data={data}
                    index="year"
                    categories={categories}
                    valueFormatter={dollarValueFormatter}
                    colors={colours}
                    showLegend={false}
                    className="h-[36rem] -ml-2"
                />

                <Subtitle>Year</Subtitle>
            </Flex>
        </Flex>
    )
}
