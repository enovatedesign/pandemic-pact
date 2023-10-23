import {Radar, RadarChart, PolarGrid, Tooltip, PolarAngleAxis, ResponsiveContainer} from 'recharts';
import VisualisationCard from "./VisualisationCard"
import {type CardProps} from "../types/card-props"
import selectOptions from '../../data/dist/select-options.json'

export default function GrantsPerResearchCategoryByRegion({globallyFilteredDataset}: CardProps) {
    const researchCategoryOptions = selectOptions.ResearchCat

    const regionOptions = selectOptions.Regions.filter(
        regionOption => !["Not known", "Unspecified"].includes(regionOption.value)
    )

    const chartData = regionOptions.map(function (regionOption) {
        const grantsInRegion = globallyFilteredDataset
            .filter((grant: any) => grant.GrantRegion === regionOption.value)

        const totalGrantsPerResearchCategory = Object.fromEntries(
            researchCategoryOptions.map(({label, value}: any) => ([
                label,
                grantsInRegion.filter((grant: any) => grant.ResearchCat.includes(value)).length,
            ]))
        )

        return {
            "Region": regionOption.label,
            ...totalGrantsPerResearchCategory,
        }
    })

    const colours = [
        '#3b82f6',
        '#f59e0b',
        '#6b7280',
        '#ef4444',
        '#71717a',
        '#64748b',
        '#22c55e',
        '#14b8a6',
        '#10b981',
        '#ec4899',
        '#f43f5e',
        '#0ea5e9',
        '#a855f7',
        '#eab308',
        '#737373',
        '#6366f1',
        '#d946ef',
        '#06b6d4',
        '#84cc16',
        '#8b5cf6',
        '#f97316',
        '#78716c',
    ]

    return (
        <VisualisationCard
            filteredDataset={globallyFilteredDataset}
            id="grant-per-research-category-by-region"
            title="Grants Per Research Category By Region"
            subtitle="Doloribus iste inventore odio sint laboriosam eaque."
            footnote="Please note that grants may fall under more than one Research Category, and Funding Amounts are included only when they have been published by the funder."
        >
            <div className="w-full h-[800px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />

                        <PolarAngleAxis
                            dataKey="Region"
                        />

                        {researchCategoryOptions.map(({label}: any, index: number) => (
                            <Radar
                                key={`${label} Radar`}
                                name={label}
                                dataKey={label}
                                stroke={colours[index]}
                                strokeWidth={1.5}
                                fill={colours[index]}
                                fillOpacity={0.075}
                            />
                        ))}

                        <Tooltip
                            isAnimationActive={false}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </VisualisationCard>
    )
}
