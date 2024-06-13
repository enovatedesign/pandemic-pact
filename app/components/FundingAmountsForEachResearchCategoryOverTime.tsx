import { useState, useContext, ReactNode } from 'react'
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
import RechartTrendsTooltipContent from './RechartTrendsTooltipContent'
import MultiSelect from './MultiSelect'
import ImageExportLegend from './ImageExportLegend'
import { sumNumericGrantAmounts } from '../helpers/reducers'
import { axisDollarFormatter } from '../helpers/value-formatters'
import { filterGrants, GlobalFilterContext } from '../helpers/filters'
import { groupBy } from 'lodash'
import researchCategoryOptions from '../../public/data/select-options/ResearchCat.json'
import {
    researchCategoryColours,
    allResearchCategoriesColour,
} from '../helpers/colours'
import { rechartBaseTooltipProps } from '../helpers/tooltip'

export default function FundingAmountsForEachResearchCategoryOverTimeCard() {
    const {
        grants: globalGrants,
        completeDataset: dataset,
        filters: selectedFilters,
    } = useContext(GlobalFilterContext)

    const [selectedResearchCategories, setSelectedResearchCategories] =
        useState<string[]>(researchCategoryOptions.map(({ value }) => value))

    const filteredDataset = filterGrants(dataset, {
        ...selectedFilters,
        ResearchCat: selectedResearchCategories,
    })

    const datasetGroupedByYear = groupBy(
        filteredDataset.filter(
            (grant: any) =>
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

    const imageExportLegend = (
        <ImageExportLegend
            categories={selectedResearchCategoryOptions.map(
                ({ label }) => label
            )}
            colours={
                showingAllResearchCategories
                    ? [allResearchCategoriesColour]
                    : selectedResearchCategoryOptions.map(
                          ({ value }) => researchCategoryColours[value]
                      )
            }
        />
    )

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
                    imageExportLegend={imageExportLegend}
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
                    imageExportLegend={imageExportLegend}
                />
            ),
        },
    ]

    return (
        <VisualisationCard
            id="amount-committed-to-each-research-category-over-time-card"
            title="Annual Trends in New Global Grants for Research Areas"
            subtitle="The chart shows the total amount of funding allocated to different research areas by calendar year of award start date."
            footnote="Please note: Grants may fall under more than one research category. Funding amounts are included only when they have been published by the funder and are included within the year of the grant award start date."
            tabs={tabs}
        >
            <div className=" flex w-full justify-between items-start mb-6 ignore-in-image-export">
                <MultiSelect
                    field="ResearchCat"
                    label="Research Categories"
                    selectedOptions={selectedResearchCategories}
                    setSelectedOptions={setSelectedResearchCategories}
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
    imageExportLegend: ReactNode
}

function BarChart({
    data,
    categories,
    showingAllResearchCategories,
    imageExportLegend,
}: ChartProps) {
    return (
        <>
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
                        content={props => (
                            <RechartTrendsTooltipContent
                                props={props}
                                chartData={data}
                                formatValuesToDollars
                            />
                        )}
                        {...rechartBaseTooltipProps}

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

            {imageExportLegend}
        </>
    )
}

function LineChart({
    data,
    categories,
    showingAllResearchCategories,
    imageExportLegend,
}: ChartProps) {
    return (
        <>
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
                        content={props => (
                            <RechartTrendsTooltipContent
                                props={props}
                                chartData={data}
                                formatValuesToDollars
                            />
                        )}
                        {...rechartBaseTooltipProps}
                    />

                    {categories.map(({ value, label }) => (
                        <Line
                            key={`line-${value}`}
                            dataKey={label}
                            stroke={
                                showingAllResearchCategories
                                    ? allResearchCategoriesColour
                                    : researchCategoryColours[value]
                            }
                            strokeWidth={2}
                        />
                    ))}
                </RechartLineChart>
            </ResponsiveContainer>

            {imageExportLegend}
        </>
    )
}
