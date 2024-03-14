import { useState, useContext } from 'react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    Tooltip,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts'
import { rechartTooltipContentFunction } from './RechartTooltipContent'
import VisualisationCard from './VisualisationCard'
import RadiusAxisLabel from './RadiusAxisLabel' 
import MultiSelect from './MultiSelect'
import researchLocationRegionOptions from '../../public/data/select-options/ResearchLocationRegion.json'
import researchCatOptions from '../../public/data/select-options/ResearchCat.json'
import dataset from '../../data/dist/grants.json'
import { filterGrants, GlobalFilterContext } from '../helpers/filters'
import {
    researchCategoryColours,
    allResearchCategoriesColour,
} from '../helpers/colours'
import { baseTooltipProps } from '../helpers/tooltip'

export default function GrantsPerResearchCategoryByRegion() {
    const { grants: globalGrants, filters: selectedFilters } =
        useContext(GlobalFilterContext)

    const [selectedResearchCategories, setSelectedResearchCategories] =
        useState<string[]>([])

    const filteredDataset = filterGrants(dataset, {
        ...selectedFilters,
        ResearchCat: selectedResearchCategories,
    })

    const regionOptions = researchLocationRegionOptions
        .filter(regionOption => !['Unspecified'].includes(regionOption.label))
        .map(regionOption => ({
            ...regionOption,
            label:
                regionOption.label === 'International'
                    ? 'Multi-Regional'
                    : regionOption.label,
        }))

    let researchCategoryOptions: { value: string; label: string }[]

    const showingAllResearchCategories = selectedResearchCategories.length === 0

    if (showingAllResearchCategories) {
        researchCategoryOptions = [
            { value: 'All', label: 'All Research Categories' },
        ]
    } else {
        researchCategoryOptions = researchCatOptions.filter(
            researchCategoryOption =>
                selectedResearchCategories.includes(
                    researchCategoryOption.value
                )
        )
    }

    const chartData = regionOptions.map(function (regionOption) {
        const grantsInRegion = filteredDataset.filter((grant: any) =>
            grant.ResearchLocationRegion.includes(regionOption.value)
        )

        if (showingAllResearchCategories) {
            return {
                Region: regionOption.label,
                'All Research Categories': grantsInRegion.length,
            }
        }

        const totalGrantsPerResearchCategory = Object.fromEntries(
            researchCategoryOptions.map(({ label, value }: any) => [
                label,
                grantsInRegion.filter((grant: any) =>
                    grant.ResearchCat.includes(value)
                ).length,
            ])
        )

        return {
            Region: regionOption.label,
            ...totalGrantsPerResearchCategory,
        }
    })

    return (
        <VisualisationCard
            id="grant-per-research-category-by-region"
            title="Regional Distribution of Funding by Research Areas"
            subtitle="Each research category is shown in a different colour"
            footnote="Please note: Grants may fall under more than one research category, and funding amounts are included only when they have been published by the funder."
        >
            <div className="flex flex-col w-full">
                <div className="flex items-center justify-between ignore-in-image-export">
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

                <div className="w-full">
                    <ResponsiveContainer width="100%" height={500}>
                        <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            data={chartData}
                        >
                            <PolarGrid />

                            <PolarAngleAxis dataKey="Region" />

                            <PolarRadiusAxis angle={90} tick={(props) => <RadiusAxisLabel {...props} />} />

                            {researchCategoryOptions.map(({ value, label }) => (
                                <Radar
                                    key={`${label} Radar`}
                                    name={label}
                                    dataKey={label}
                                    stroke={
                                        showingAllResearchCategories
                                            ? allResearchCategoriesColour
                                            : researchCategoryColours[value]
                                    }
                                    strokeWidth={2.5}
                                    fillOpacity={0}
                                />
                            ))}

                            <Tooltip
                                content={rechartTooltipContentFunction}
                                {...baseTooltipProps}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </VisualisationCard>
    )
}
