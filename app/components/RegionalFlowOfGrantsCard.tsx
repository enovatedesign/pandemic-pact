import {useState, useContext} from "react"
import VisualisationCard from "./VisualisationCard"
import DoubleLabelSwitch from "./DoubleLabelSwitch"
import {Layer, Rectangle, ResponsiveContainer, Sankey, Tooltip} from 'recharts';
import {groupBy} from "lodash"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import {GlobalFilterContext} from "../helpers/filter";
import {dollarValueFormatter} from "../helpers/value-formatters"

export default function RegionalFlowOfGrantsCard() {
    const {grants} = useContext(GlobalFilterContext)

    const [displayTotalMoneyCommitted, setDisplayTotalMoneyCommitted] = useState<boolean>(false)

    const colours = {
        "Africa": "#3b82f6",
        "Americas": "#f59e0b",
        "South-East Asia": "#6b7280",
        "Europe": "#ef4444",
        "Eastern Mediterranean": "#71717a",
        "Western Pacific": "#64748b",
    }

    const nodeGroups = [
        {
            field: 'FunderRegion',
            names: [
                "Africa",
                "Americas",
                "South-East Asia",
                "Europe",
                "Eastern Mediterranean",
                "Western Pacific",
            ]
        },

        {
            field: 'ResearchInstitutionRegion',
            names: [
                "Africa",
                "Americas",
                "South-East Asia",
                "Europe",
                "Eastern Mediterranean",
                "Western Pacific",
            ]
        },

        {
            field: 'ResearchLocationRegion',
            names: [
                "Africa",
                "Americas",
                "South-East Asia",
                "Europe",
                "Eastern Mediterranean",
                "Western Pacific",
            ]
        },
    ]

    const nodes = nodeGroups.map(
        ({field, names}, group) => names.filter(
            name => grants.some(
                grant => grant[field] === name
            )
        ).map(
            name => ({name, group})
        )
    ).flat(1)

    let links: any[] = [];

    for (let i = 0, len = nodeGroups.length; i < len - 1; i++) {
        const sourceGroup = i;
        const targetGroup = i + 1;

        const {field: sourceField} = nodeGroups[sourceGroup]
        const {field: targetField} = nodeGroups[targetGroup]

        links = links.concat(
            Object.entries(
                groupBy(grants, sourceField)
            ).map(
                ([sourceFieldValue, grants]) => Object.entries(
                    groupBy(grants, targetField)
                ).map(
                    ([targetFieldValue, grants]) => ({
                        source: nodes.findIndex(node => node.name === sourceFieldValue && node.group === sourceGroup),
                        target: nodes.findIndex(node => node.name === targetFieldValue && node.group === targetGroup),
                        value: displayTotalMoneyCommitted ? grants.reduce(...sumNumericGrantAmounts) : grants.length,
                    })
                )
            ).flat(2)
        )
    }

    return (
        <VisualisationCard
            grants={grants}
            id="regional-flow-of-grants"
            title="Regional Flow of Research Grants"
            subtitle="The chart illustrated the flow of research grants by region from funder to research institution to the location where the research is conducted"
            footnote="Please note: Funding amounts are included only when they have been published by the funder."
        >
            <div className="w-full">
                {links.length > 0 &&
                    <div className="flex flex-col justify-center gap-y-8">
                        <ResponsiveContainer width="100%" height={600}>
                            <Sankey
                                data={{nodes, links}}
                                nodePadding={30}
                                margin={{
                                    left: 0,
                                    right: 0,
                                    top: 40,
                                    bottom: 80,
                                }}
                                node={
                                    <SankeyNode
                                        colours={colours}
                                        displayTotalMoneyCommitted={displayTotalMoneyCommitted}
                                        totalNodeGroups={nodeGroups.length}
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

                                <text
                                    x={0}
                                    y={580}
                                    fontSize="16"
                                    fill="#666"
                                    textAnchor="start"
                                >
                                    Funder Region
                                </text>

                                <text
                                    x="50%"
                                    y={580}
                                    fontSize="16"
                                    fill="#666"
                                    textAnchor="middle"
                                >
                                    Research Institution Region
                                </text>

                                <text
                                    x="100%"
                                    y={580}
                                    fontSize="16"
                                    fill="#666"
                                    textAnchor="end"
                                >
                                    Research Location Region
                                </text>
                            </Sankey>
                        </ResponsiveContainer>

                        <DoubleLabelSwitch
                            checked={displayTotalMoneyCommitted}
                            onChange={setDisplayTotalMoneyCommitted}
                            leftLabel="Total Number of Grants"
                            rightLabel="US Dollars Committed"
                            screenReaderLabel="Display Total Money Committed"
                            className="justify-center"
                        />
                    </div>
                }

                {links.length === 0 &&
                    <p className="p-4 text-center">No Data.</p>
                }
            </div>
        </VisualisationCard>
    )
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyNode.tsx
function SankeyNode(props: any) {
    const {x, y, width, height, index, payload, colours, displayTotalMoneyCommitted, totalNodeGroups} = props;

    const {name, value, group} = payload;

    const isLastNode = group === totalNodeGroups - 1

    const fill = colours[name as keyof typeof colours]

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
                textAnchor={isLastNode ? 'end' : 'start'}
                x={isLastNode ? x - 6 : x + width + 6}
                y={y + height / 2}
                fontSize="16"
                fill="#000"
            >
                {name}
            </text>

            <text
                textAnchor={isLastNode ? 'end' : 'start'}
                x={isLastNode ? x - 6 : x + width + 6}
                y={y + height / 2 + 16}
                fontSize="14"
                fill="#000"
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
