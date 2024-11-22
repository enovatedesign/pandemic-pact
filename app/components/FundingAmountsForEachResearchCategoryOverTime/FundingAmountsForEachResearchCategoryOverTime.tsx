import { useState, useContext } from 'react'

import {
    PresentationChartBarIcon,
    PresentationChartLineIcon,
} from '@heroicons/react/solid'
import VisualisationCard from '../VisualisationCard'
import MultiSelect from '../MultiSelect'
import ImageExportLegend from '../ImageExportLegend'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { filterGrants, GlobalFilterContext } from '../../helpers/filters'
import { groupBy } from 'lodash'
import researchCategoryOptions from '../../../public/data/select-options/ResearchCat.json'
import {
    researchCategoryColours,
    allResearchCategoriesColour,
} from '../../helpers/colours'
import LineChart from './LineChart'
import BarChart from './BarChart'
import { fundingAmountsForEachResearchCategoryOverTimeFallback } from '../NoData/visualisationFallbackData'

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

    const chartData = amountCommittedToEachResearchCategoryOverTime.length === 0 
        ? fundingAmountsForEachResearchCategoryOverTimeFallback 
        : amountCommittedToEachResearchCategoryOverTime
        
    const tabs = [
        {
            tab: {
                icon: PresentationChartBarIcon,
                label: 'Bar',
            },
            content: (
                <BarChart
                    data={chartData}
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
                    data={chartData}
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