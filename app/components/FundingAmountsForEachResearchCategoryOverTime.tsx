import {useState, useContext} from "react"
import { BarChart as TremorBarChart, LineChart as TremorLineChart, Color} from "@tremor/react"
import {PresentationChartBarIcon, PresentationChartLineIcon} from "@heroicons/react/solid"
import VisualisationCard from "./VisualisationCard"
import MultiSelect from "./MultiSelect"
import {filterGrants} from "../helpers/filter"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import {dollarValueFormatter} from "../helpers/value-formatters"
import {GlobalFilterContext} from "../helpers/filter"
import {groupBy} from 'lodash'
import dataset from '../../data/dist/grants.json'
import selectOptions from '../../data/dist/select-options.json'

export default function FundingAmountsForEachResearchCategoryOverTimeCard() {
    const {grants: globalGrants, filters: selectedFilters} = useContext(GlobalFilterContext)

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

    for (let i = 0; i < 13; i++) {
        selectedResearchCategories[i - 1] = i.toString();
    }

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
                icon: PresentationChartBarIcon,
                label: "Bar",
            },
            content: <BarChart data={amountCommittedToEachResearchCategoryOverTime} categories={researchCategories} colours={colours} />,
        },
        {
            tab: {
                icon: PresentationChartLineIcon,
                label: "Lines",
            },
            content: <LineChart data={amountCommittedToEachResearchCategoryOverTime} categories={researchCategories} colours={colours} />,
        },
    ]

    return (
        <VisualisationCard
            grants={filteredDataset}
            id="amount-committed-to-each-research-category-over-time-card"
            title="Global Annual Funding For Research Categories"
            subtitle="Ipsam vero quae beatae quas nemo quae necessitatibus commodi. Fuga laboriosam possimus corrupti dolore eveniet maiores. Porro laboriosam laboriosam assumenda esse porro placeat voluptatum."
            footnote="Please note: Grants may fall under more than one research category, and funding amounts are included only when they have been published by the funder."
            tabs={tabs}
        >
            <div className=" flex w-full justify-between items-start mb-6 ignore-in-image-export">
                <MultiSelect
                    options={selectOptions.ResearchCat}
                    selectedOptions={selectedResearchCategories}
                    setSelectedOptions={setSelectedResearchCategories}
                    placeholder="All Research Categories"
                    className="max-w-xs ignore-in-image-export"
                />

                {filteredDataset.length < globalGrants.length &&
                    <p>Filtered Grants: {filteredDataset.length}</p>
                }
            </div>
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
        <div className="w-full h-full flex relative">
            <div className="w-16">
                <p className="absolute top-1/2 whitespace-nowrap -rotate-90 -translate-x-1/3 text-brand-grey-500">Amount Committed (USD)</p>
            </div>

            <div className="flex flex-col space-y-2 w-full">
                <TremorBarChart
                    data={data}
                    index="year"
                    categories={categories}
                    valueFormatter={dollarValueFormatter}
                    colors={colours}
                    showLegend={false}
                    className="h-[36rem] -ml-2"
                />

                <p className="text-brand-grey-500">Year</p>
            </div>
        </div>
    )
}

function LineChart({data, categories, colours}: ChartProps) {
    return (
        <div className="w-full h-full flex">
            <div className="w-16">
                <p className="absolute top-1/2 whitespace-nowrap -rotate-90 -translate-x-1/3 text-brand-grey-500">Amount Committed (USD)</p>
            </div>

            <div className="flex flex-col space-y-2 w-full">
                <TremorLineChart
                    data={data}
                    index="year"
                    categories={categories}
                    valueFormatter={dollarValueFormatter}
                    colors={colours}
                    showLegend={false}
                    className="h-[36rem] -ml-2"
                />

                <p className="text-brand-grey-500">Year</p>
            </div>
        </div>
    )
}
