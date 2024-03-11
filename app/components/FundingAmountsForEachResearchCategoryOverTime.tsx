import { useState, useContext } from 'react'
import {
    BarChart as RechartBarChart,
    Bar,
    LineChart as RechartLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import {
    PresentationChartBarIcon,
    PresentationChartLineIcon,
} from '@heroicons/react/solid'
import VisualisationCard from './VisualisationCard'
import MultiSelect from './MultiSelect'
import { sumNumericGrantAmounts } from '../helpers/reducers'
import {
    dollarValueFormatter,
    axisDollarFormatter,
} from '../helpers/value-formatters'
import { filterGrants, GlobalFilterContext } from '../helpers/filters'
import { groupBy } from 'lodash'
import dataset from '../../data/dist/grants.json'
import researchCategoryOptions from '../../public/data/select-options/ResearchCat.json'
import {
    researchCategoryColours,
    allResearchCategoriesColour,
} from '../helpers/colours'
import { baseTooltipProps } from '../helpers/tooltip'

export default function FundingAmountsForEachResearchCategoryOverTimeCard() {
    const { grants: globalGrants, filters: selectedFilters } =
        useContext(GlobalFilterContext)

    const [selectedResearchCategories, setSelectedResearchCategories] =
        useState<string[]>(researchCategoryOptions.map(({ value }) => value))

    const filteredDataset = filterGrants(dataset, {
        ...selectedFilters,
        ResearchCat: selectedResearchCategories,
    })

    const datasetGroupedByYear = groupBy(
        filteredDataset
            .filter((grant: any) => 
                grant?.TrendStartYear && 
                !isNaN(grant.TrendStartYear) && 
                grant.TrendStartYear >= 2020
            ),
            'TrendStartYear'
    )

    const showingAllResearchCategories = selectedResearchCategories.length === 0

    const selectedResearchCategoryOptions: { value: string; label: string }[] =
        showingAllResearchCategories
            ? [
                  {
                      value: 'All Research Categories',
                      label: 'All Research Categories',
                  },
              ]
            : researchCategoryOptions.filter(researchCategory =>
                  selectedResearchCategories.includes(researchCategory.value)
              )

    const amountCommittedToEachResearchCategoryOverTime = Object.keys(
        datasetGroupedByYear
    ).map(year => {
        const grants = datasetGroupedByYear[year]

        let dataPoint: { [key: string]: string | number } = { year }

            if (showingAllResearchCategories) {
                dataPoint['All Research Categories'] = grants.reduce(
                    ...sumNumericGrantAmounts
            )
        } else {
            selectedResearchCategoryOptions.forEach(
                selectedResearchCategoryOption => {
                    dataPoint[selectedResearchCategoryOption.label] = grants
                        .filter(grant =>
                            grant.ResearchCat.includes(
                                selectedResearchCategoryOption.value
                            )
                        )
                        .reduce(...sumNumericGrantAmounts)
                }
            )
        }

        return dataPoint
    })

    const tabs = [
        {
            tab: {
                icon: PresentationChartBarIcon,
                label: 'Bar',
            },
            content: (
                <BarChart
                    data={amountCommittedToEachResearchCategoryOverTime}
                    categories={selectedResearchCategoryOptions}
                    showingAllResearchCategories={showingAllResearchCategories}
                />
            ),
        },
        {
            tab: {
                icon: PresentationChartLineIcon,
                label: 'Lines',
            },
            content: (
                <LineChart
                    data={amountCommittedToEachResearchCategoryOverTime}
                    categories={selectedResearchCategoryOptions}
                    showingAllResearchCategories={showingAllResearchCategories}
                />
            ),
        },
    ]

    return (
        <VisualisationCard
            id="amount-committed-to-each-research-category-over-time-card"
            title="Annual Trends in New Global Grants for Research Areas "
            subtitle="The chart shows the total amount of funding allocated to different research areas by calendar year of award start date."
            footnote="Please note: Grants may fall under more than one research category. Funding amounts are included only when they have been published by the funder and are included within the year of the grant award start date."
            tabs={tabs}
        >
            <div className=" flex w-full justify-between items-start mb-6 ignore-in-image-export">
                <MultiSelect
                    field="ResearchCat"
                    selectedOptions={selectedResearchCategories}
                    setSelectedOptions={setSelectedResearchCategories}
                    placeholder="All Research Categories"
                    className="max-w-xs ignore-in-image-export"
                />

                {filteredDataset.length < globalGrants.length && (
                    <p>Filtered Grants: {filteredDataset.length}</p>
                )}
            </div>
        </VisualisationCard>
    )
}

interface ChartProps {
    data: any[]
    categories: { value: string; label: string }[]
    showingAllResearchCategories: boolean
}

function BarChart({
    data,
    categories,
    showingAllResearchCategories,
}: ChartProps) {
    return (
        <ResponsiveContainer width="100%" height={500}>
            <RechartBarChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 20,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                    dataKey="year"
                    label={{
                        value: 'Year of Award Start',
                        position: 'bottom',
                        offset: 0,
                    }}
                />

                <YAxis
                    tickFormatter={axisDollarFormatter}
                    label={{
                        value: 'Known Financial Commitments (USD)',
                        position: 'left',
                        angle: -90,
                        style: { textAnchor: 'middle' },
                        offset: 10,
                    }}
                />

                <Tooltip
                    formatter={dollarValueFormatter}
                    isAnimationActive={false}
                    {...baseTooltipProps}
                />

                {categories.map(({ value, label }) => (
                    <Bar
                        key={`bar-${value}`}
                        dataKey={label}
                        fill={
                            showingAllResearchCategories
                                ? allResearchCategoriesColour
                                : researchCategoryColours[value]
                        }
                    />
                ))}
            </RechartBarChart>
        </ResponsiveContainer>
    )
}

function LineChart({
    data,
    categories,
    showingAllResearchCategories,
}: ChartProps) {
    return (
        <ResponsiveContainer width="100%" height={500}>
            <RechartLineChart
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 20,
                }}
                data={data}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                    type="category"
                    dataKey="year"
                    label={{
                        value: 'Year',
                        position: 'bottom',
                        offset: 0,
                    }}
                />

                <YAxis
                    type="number"
                    tickFormatter={axisDollarFormatter}
                    label={{
                        value: 'Known Financial Commitments (USD)',
                        position: 'left',
                        angle: -90,
                        style: { textAnchor: 'middle' },
                        offset: 10,
                    }}
                />

                <Tooltip
                    formatter={dollarValueFormatter}
                    isAnimationActive={false}
                    {...baseTooltipProps}
                />

                {categories.map(({ value, label }) => (
                    <Line
                        key={`line-${value}`}
                        type="monotone"
                        dataKey={label}
                        stroke={
                            showingAllResearchCategories
                                ? allResearchCategoriesColour
                                : researchCategoryColours[value]
                        }
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </RechartLineChart>
        </ResponsiveContainer>
    )
}
