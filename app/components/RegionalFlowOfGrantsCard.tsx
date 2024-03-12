import { useState, useContext } from 'react'
import VisualisationCard from './VisualisationCard'
import DoubleLabelSwitch from './DoubleLabelSwitch'
import {
    Layer,
    Rectangle,
    ResponsiveContainer,
    Sankey,
    Tooltip,
} from 'recharts'
import { groupBy } from 'lodash'
import { sumNumericGrantAmounts } from '../helpers/reducers'
import { GlobalFilterContext } from '../helpers/filters'
import { dollarValueFormatter } from '../helpers/value-formatters'
import { brandColours } from '../helpers/colours'
import selectOptions from '../../data/dist/select-options.json'
import { baseTooltipProps } from '../helpers/tooltip'

export default function RegionalFlowOfGrantsCard() {
    const { grants } = useContext(GlobalFilterContext)

    const [displayTotalMoneyCommitted, setDisplayTotalMoneyCommitted] =
        useState<boolean>(false)

    const colours = {
        '1': brandColours.blue['500'],
        '2': brandColours.green['500'],
        '5': brandColours.orange['500'],
        '99999': brandColours.teal['400'],
        '9999': brandColours.blue.DEFAULT,
        '999999': brandColours.teal['800'],
        '9999999': brandColours.orange['900'],
    }

    const nodeGroups = [
        {
            field: 'FunderRegion',
            options: selectOptions['FunderRegion'],
        },

        {
            field: 'ResearchInstitutionRegion',
            options: selectOptions['ResearchInstitutionRegion'],
        },

        {
            field: 'ResearchLocationRegion',
            options: selectOptions['ResearchLocationRegion'],
        },
    ]

    const grantsWithRegions = grants.filter(
        grant =>
            grant.FunderRegion.length === 1 &&
            grant.ResearchInstitutionRegion.length === 1 &&
            grant.ResearchLocationRegion.length === 1
    )

    const nodes = nodeGroups
        .map(({ field, options }, group) =>
            options
                .filter((option: any) =>
                    grantsWithRegions.some(grant =>
                        grant[field].includes(option.value)
                    )
                )
                .map((option: any) => ({ option, group }))
        )
        .flat(1)

    let links: any[] = []

    for (let i = 0, len = nodeGroups.length; i < len - 1; i++) {
        const sourceGroup = i
        const targetGroup = i + 1

        const { field: sourceField } = nodeGroups[sourceGroup]
        const { field: targetField } = nodeGroups[targetGroup]

        links = links.concat(
            Object.entries(groupBy(grantsWithRegions, sourceField))
                .map(([sourceFieldValue, grantsWithRegions]) =>
                    Object.entries(groupBy(grantsWithRegions, targetField)).map(
                        ([targetFieldValue, grantsWithRegions]) => ({
                            source: nodes.findIndex(
                                node =>
                                    node.option.value === sourceFieldValue &&
                                    node.group === sourceGroup
                            ),
                            target: nodes.findIndex(
                                node =>
                                    node.option.value === targetFieldValue &&
                                    node.group === targetGroup
                            ),
                            value: displayTotalMoneyCommitted
                                ? grantsWithRegions.reduce(
                                      ...sumNumericGrantAmounts
                                  )
                                : grantsWithRegions.length,
                        })
                    )
                )
                .flat(2)
        )
    }

    const tooltipFormatter = (value: any, _: string, { payload }: any) => {
        const details = payload.payload

        const label = details.option
            ? details.option.label
            : `${details.source.option.label} → ${details.target.option.label}`

        return [
            displayTotalMoneyCommitted
                ? dollarValueFormatter(details.value)
                : details.value,
            label,
        ]
    }

    return (
        <VisualisationCard
            id="regional-flow-of-grants"
            title="Regional Flow of Research Grants"
            subtitle="The chart illustrates the flow of research grants by region, tracing it from funder to research institution and ultimately to the location where the research is conducted."
            chartInstructions="If the full chart is not visible, please scroll horizontally to view."
            footnote="Please note: Funding amounts are included only when they have been published by the funder. Some research projects are undertaken in multiple locations (countries). Where research location is not explicitly specified the default used is the location of the research institution receiving the funds."
        >
            <div className="w-full">
                {links.length > 0 && (
                    <>
                        <div className="breakout">
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden">
                                        <ResponsiveContainer height={500} className="px-6 md:px-0">
                                            <Sankey
                                                data={{ nodes, links }}
                                                nodePadding={30}
                                                margin={{
                                                    left: 0,
                                                    right: 0,
                                                    top: 40,
                                                    bottom: 40,
                                                }}
                                                node={
                                                    <SankeyNode
                                                    colours={colours}
                                                    displayTotalMoneyCommitted={
                                                        displayTotalMoneyCommitted
                                                    }
                                                    totalNodeGroups={nodeGroups.length}
                                                    />
                                                }
                                                link={<SankeyLink colours={colours} />}
                                                >
                                                <Tooltip
                                                    isAnimationActive={false}
                                                    formatter={tooltipFormatter}
                                                    {...baseTooltipProps}
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
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DoubleLabelSwitch
                            checked={displayTotalMoneyCommitted}
                            onChange={setDisplayTotalMoneyCommitted}
                            leftLabel="Total Number of Grants"
                            rightLabel="US Dollars Committed"
                            screenReaderLabel="Display Total Money Committed"
                            className="justify-center mt-6"
                        />
                    </>
                )}

                {links.length === 0 && (
                    <p className="p-4 text-center">No Data.</p>
                )}
            </div>
        </VisualisationCard>
    )
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyNode.tsx
function SankeyNode(props: any) {
    const {
        x,
        y,
        width,
        height,
        index,
        payload,
        colours,
        displayTotalMoneyCommitted,
        totalNodeGroups,
    } = props

    const { option, value, group } = payload

    const isLastNode = group === totalNodeGroups - 1

    const fill = colours[option.value as keyof typeof colours]

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
                {option.label}:{' '}
                {displayTotalMoneyCommitted
                    ? dollarValueFormatter(value)
                    : value}
            </text>
        </Layer>
    )
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyLink.tsx
function SankeyLink({
    sourceX,
    targetX,
    sourceY,
    targetY,
    sourceControlX,
    targetControlX,
    linkWidth,
    index,
    payload,
    colours,
}: any) {
    const gradientId = `regionalFlowOfGrantsCardGradient${index}`
    const sourceColour =
        colours[payload.source.option.value as keyof typeof colours]
    const targetColour =
        colours[payload.target.option.value as keyof typeof colours]

    return (
        <Layer key={`RegionalFlowOfGrantsCardLink${index}`}>
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
    )
}
