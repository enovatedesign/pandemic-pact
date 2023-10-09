import {useState} from "react"
import {Card, Text, Title, Subtitle} from "@tremor/react"
import {Switch} from '@headlessui/react'
import {Layer, Rectangle, ResponsiveContainer, Sankey, Tooltip} from 'recharts';
import {useDarkMode} from 'usehooks-ts'
import {groupBy} from "lodash"
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import {dollarValueFormatter} from "../helpers/value-formatters"
import dataset from '../../data/dist/filterable-dataset.json'

export default function RegionalFlowOfGrantsCard({selectedFilters}: CardProps) {
    const filteredDataset = filterGrants(dataset, selectedFilters)

    const [displayTotalMoneyCommitted, setDisplayTotalMoneyCommitted] = useState<boolean>(false)

    const colours = {
        "Africa": "#3b82f6",
        "Americas": "#f59e0b",
        "South-East Asia": "#6b7280",
        "Europe": "#ef4444",
        "Eastern Mediterranean": "#71717a",
        "Western Pacific": "#64748b",
    }

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
                source: nodes.findIndex(node => node.name === funderRegion && !node.isTarget),
                target: nodes.findIndex(node => node.name === researchInstitutionRegion && node.isTarget),
                value: displayTotalMoneyCommitted ? grants.reduce(...sumNumericGrantAmounts) : grants.length,
            })
        )
    ).flat(1)

    return (
        <Card
            id="sankey-test"
        >
            <Title>Regional Flow Of Grants</Title>

            <div className="w-full flex items-center">
                <div className="w-16">
                    <Subtitle className="absolute whitespace-nowrap -rotate-90 -translate-x-1/3">Funder Region</Subtitle>
                </div>

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
                        node={
                            <SankeyNode
                                colours={colours}
                                displayTotalMoneyCommitted={displayTotalMoneyCommitted}
                            />
                        }
                        link={
                            <SankeyLink
                                colours={colours}
                            />
                        }
                    >
                        <Tooltip
                            isAnimationActive={false}
                            formatter={displayTotalMoneyCommitted ? dollarValueFormatter : undefined}
                        />
                    </Sankey>
                </ResponsiveContainer>

                <div className="w-16">
                    <Subtitle className="absolute whitespace-nowrap rotate-90 -translate-x-1/3">Research Institution Region</Subtitle>
                </div>
            </div>

            <div className="flex items-center gap-x-2">
                <Text className={opaqueTextIf(!displayTotalMoneyCommitted)}>Total Grants</Text>

                <Switch
                    checked={displayTotalMoneyCommitted}
                    onChange={setDisplayTotalMoneyCommitted}
                    className="relative inline-flex items-center h-6 bg-blue-600 rounded-full w-11"
                >
                    <span className="sr-only">Display Total Money Committed</span>

                    <span
                        className={`${displayTotalMoneyCommitted ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                </Switch>

                <Text className={opaqueTextIf(displayTotalMoneyCommitted)}>Total Amount Committed (USD)</Text>
            </div>
        </Card >
    )
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyNode.tsx
function SankeyNode({x, y, width, height, index, payload, colours, displayTotalMoneyCommitted}: any) {
    const {isTarget, name, value} = payload;

    const fill = colours[name as keyof typeof colours]

    const {isDarkMode} = useDarkMode()

    const labelFill = isDarkMode ? "#fff" : "#000"

    return (
        <Layer key={`RegionalFlowOfGrantsCardNode${index}`}>
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
                fill={labelFill}
            >
                {name}
            </text>

            <text
                textAnchor={isTarget ? 'end' : 'start'}
                x={isTarget ? x - 6 : x + width + 6}
                y={y + height / 2 + 16}
                fontSize="14"
                fill={labelFill}
                fillOpacity="0.8"
            >
                {displayTotalMoneyCommitted ? dollarValueFormatter(value) : value}
            </text>
        </Layer>
    );
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyLink.tsx
function SankeyLink({sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload, colours}: any) {
    const gradientId = `regionalFlowOfGrantsCardGradient${index}`
    const sourceColour = colours[payload.source.name as keyof typeof colours]
    const targetColour = colours[payload.target.name as keyof typeof colours]

    return <Layer key={`RegionalFlowOfGrantsCardLink${index}`}>
        <defs>
            <linearGradient id={gradientId}>
                <stop offset="0%" stopColor={sourceColour} />
                <stop offset="100%" stopColor={targetColour} />
            </linearGradient>
        </defs>

        <path
            fill={`url(#${gradientId})`}
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

function opaqueTextIf(condition: boolean) {
    return condition ? 'opacity-100 text-black' : 'opacity-75'
}
