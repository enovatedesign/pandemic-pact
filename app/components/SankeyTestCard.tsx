import {Flex, Card, Title, Subtitle, Text} from "@tremor/react"
import {Radar, RadarChart, PolarGrid, Tooltip, PolarAngleAxis, ResponsiveContainer, Sankey} from 'recharts';
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'
import {groupBy} from "lodash"

export default function SankeyTestCard({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)

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

    const nodes = [
        // Source Regions
        {"name": "Africa", "type": "source"},
        {"name": "Americas", "type": "source"},
        {"name": "South-East Asia", "type": "source"},
        {"name": "Europe", "type": "source"},
        {"name": "Eastern Mediterranean", "type": "source"},
        {"name": "Western Pacific", "type": "source"},

        // Target Regions
        {"name": "Africa", "type": "target"},
        {"name": "Americas", "type": "target"},
        {"name": "South-East Asia", "type": "target"},
        {"name": "Europe", "type": "target"},
        {"name": "Eastern Mediterranean", "type": "target"},
        {"name": "Western Pacific", "type": "target"},
    ]

    const links = Object.entries(
        groupBy(filteredDataset, 'FunderRegion')
    ).map(
        ([funderRegion, grants]) => Object.entries(
            groupBy(grants, 'ResearchInstitutionRegion')
        ).map(
            ([researchInstitutionRegion, grants]) => ({
                "source": nodes.findIndex(node => node.name === funderRegion && node.type === 'source'),
                "target": nodes.findIndex(node => node.name === researchInstitutionRegion && node.type === 'target'),
                "value": grants.length,
            })
        )
    ).flat(1)

    return (
        <Card
            id="sankey-test"
        >
            <Title>Sankey Test</Title>

            <div className="w-full">
                <ResponsiveContainer width="100%" height={600}>
                    <Sankey
                        data={{nodes, links}}
                        nodePadding={20}
                        margin={{
                            left: 0,
                            right: 0,
                            top: 25,
                            bottom: 25,
                        }}
                        link={{stroke: '#87CEEB'}}
                    >
                        <Tooltip />
                    </Sankey>
                </ResponsiveContainer>
            </div>
        </Card >
    )
}
