import {Flex, Card, Title, Subtitle, Text} from "@tremor/react"
import {Layer, Rectangle, ResponsiveContainer, Sankey, Tooltip} from 'recharts';
import {exportRequestBodyFilteredToMatchingGrants} from "../helpers/meilisearch"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'
import {groupBy} from "lodash"

const colours = {
    "Africa": "#3b82f6",
    "Americas": "#f59e0b",
    "South-East Asia": "#6b7280",
    "Europe": "#ef4444",
    "Eastern Mediterranean": "#71717a",
    "Western Pacific": "#64748b",
}

// const colours = [
//     '#3b82f6',
//     '#f59e0b',
//     '#6b7280',
//     '#ef4444',
//     '#71717a',
//     '#64748b',
//     '#22c55e',
//     '#14b8a6',
//     '#10b981',
//     '#ec4899',
//     '#f43f5e',
//     '#0ea5e9',
//     '#a855f7',
//     '#eab308',
//     '#737373',
//     '#6366f1',
//     '#d946ef',
//     '#06b6d4',
//     '#84cc16',
//     '#8b5cf6',
//     '#f97316',
//     '#78716c',
// ]

export default function SankeyTestCard({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)

    const nodes = [
        // Source Regions
        {"name": "Africa", isTarget: false},
        {"name": "Americas", isTarget: false},
        {"name": "South-East Asia", isTarget: false},
        {"name": "Europe", isTarget: false},
        {"name": "Eastern Mediterranean", isTarget: false},
        {"name": "Western Pacific", isTarget: false},

        // Target Regions
        {"name": "Africa", isTarget: true},
        {"name": "Americas", isTarget: true},
        {"name": "South-East Asia", isTarget: true},
        {"name": "Europe", isTarget: true},
        {"name": "Eastern Mediterranean", isTarget: true},
        {"name": "Western Pacific", isTarget: true},
    ].filter(
        node => node.isTarget ?
            filteredDataset.some((grant: any) => grant.ResearchInstitutionRegion === node.name) :
            filteredDataset.some((grant: any) => grant.FunderRegion === node.name)
    )

    const links = Object.entries(
        groupBy(filteredDataset, 'FunderRegion')
    ).map(
        ([funderRegion, grants]) => Object.entries(
            groupBy(grants, 'ResearchInstitutionRegion')
        ).map(
            ([researchInstitutionRegion, grants]) => ({
                "source": nodes.findIndex(node => node.name === funderRegion && !node.isTarget),
                "target": nodes.findIndex(node => node.name === researchInstitutionRegion && node.isTarget),
                "value": grants.length,
            })
        )
    ).flat(1)

    return (
        <Card
            id="sankey-test"
        >
            <Title>Regional Flow Of Grants</Title>

            <div className="w-full">
                <ResponsiveContainer width="100%" height={600}>
                    <Sankey
                        data={{nodes, links}}
                        nodePadding={30}
                        margin={{
                            left: 0,
                            right: 0,
                            top: 30,
                            bottom: 30,
                        }}
                        node={<SankeyNode />}
                        link={<SankeyLink />}
                    >
                        <Tooltip
                            isAnimationActive={false}
                        />
                    </Sankey>
                </ResponsiveContainer>
            </div>
        </Card >
    )
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyNode.tsx
function SankeyNode({x, y, width, height, index, payload}: any) {
    const {isTarget, name, value} = payload;

    const fill = colours[name as keyof typeof colours]

    return (
        <Layer key={`CustomNode${index}`}>
            <Rectangle
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                fillOpacity="1"
            />

            <text
                textAnchor={isTarget ? 'end' : 'start'}
                x={isTarget ? x - 6 : x + width + 6}
                y={y + height / 2}
                fontSize="16"
                fill="#fff"
            >
                {name}
            </text>

            <text
                textAnchor={isTarget ? 'end' : 'start'}
                x={isTarget ? x - 6 : x + width + 6}
                y={y + height / 2 + 16}
                fontSize="14"
                fill="#fff"
                fillOpacity="0.8"
            >
                {value}
            </text>
        </Layer>
    );
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyLink.tsx
function SankeyLink({sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload}: any) {

    const fill = colours[payload.source.name as keyof typeof colours]

    return <Layer key={`CustomLink${index}`}>
        <path
            fill={fill}
            fillOpacity="0.25"
            strokeWidth="0"
            d={`
            M${sourceX},${sourceY + linkWidth / 2}
            C${sourceControlX},${sourceY + linkWidth / 2}
              ${targetControlX},${targetY + linkWidth / 2}
              ${targetX},${targetY + linkWidth / 2}
            L${targetX},${targetY - linkWidth / 2}
            C${targetControlX},${targetY - linkWidth / 2}
              ${sourceControlX},${sourceY - linkWidth / 2}
              ${sourceX},${sourceY - linkWidth / 2}
            Z
          `}
        />
    </Layer>
}
