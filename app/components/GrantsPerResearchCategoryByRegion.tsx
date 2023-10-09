import {Flex, Card, Title, Subtitle, Text, CategoryBar, Color, Button} from "@tremor/react"
import {Radar, RadarChart, PolarGrid, Tooltip, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer} from 'recharts';
import ExportToPngButton from "./ExportToPngButton"
import ExportToCsvButton from "./ExportToCsvButton"
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'

export default function GrantsPerResearchCategoryByRegion({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)

    const researchCategoryOptions = selectOptions.ResearchCat

    const regionOptions = selectOptions.Regions

    const chartData = regionOptions.map(function (regionOption) {
        const grantsInRegion = filteredDataset
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
        <Card
            className="flex flex-col gap-y-6"
            id="grants-by-mesh-classification-card"
        >
            <Flex
                flexDirection="col"
                alignItems="start"
                className="gap-y-2"
            >
                <Title>Grants Per Research Category By Region</Title>

                <Subtitle>
                    Doloribus iste inventore odio sint laboriosam eaque.
                </Subtitle>
            </Flex>

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
                                fill={colours[index]}
                                fillOpacity={0.2}
                            />
                        ))}

                        <Tooltip
                            isAnimationActive={false}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <Flex
                justifyContent="end"
                alignItems="center"
                className="gap-x-2 ignore-in-image-export"
            >
                <ExportToPngButton
                    selector="#grants-by-mesh-classification-card"
                    filename="grant-by-mesh-classification-card"
                />

                <ExportToCsvButton
                    meilisearchRequestBody={exportRequestBodyFilteredToMatchingGrants(filteredDataset)}
                    filename="grant-by-mesh-classification"
                />
            </Flex>
        </Card>
    )
}
