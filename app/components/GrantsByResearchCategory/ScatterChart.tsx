'use client'

import {
    ScatterChart as RechartScatterChart,
    Scatter,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from 'recharts'
import { axisDollarFormatter } from '../../helpers/value-formatters'
import { researchCategoryColours } from '../../helpers/colours'
import Legend from '../Legend'
import { useState } from 'react'
import AnimateHeight from 'react-animate-height'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { baseTooltipProps } from '../../helpers/tooltip'
import { dollarValueFormatter } from '../../helpers/value-formatters'
import { GrantAndFinancialCommitmentBarListData } from '../GrantAndFinancialCommitmentBarList'
import TooltipContent from '../TooltipContent'

interface Props {
    chartData: GrantAndFinancialCommitmentBarListData
}

const CustomDot = (props: any) => {
    const { cx, cy, fill } = props
    return <circle cx={cx} cy={cy} r={6} fill={fill} />
}

export default function ScatterChart({ chartData }: Props) {
    const [showLegend, setShowLegend] = useState<boolean>(false)
    const [showLegendButton, setShowLegendButton] = useState<boolean>(true)

    const researchCategories = chartData.map(data => ({
        label: data['Category Label'],
        value: data['Category Value'],
    }))

    const tooltipContent = (props: any) => {
        const { active, payload } = props

        if (!active) return null

        const title = payload[0].payload['Category Label']

        const items = payload.map((item: any) => ({
            label: item.name,
            value: item.name.includes('(USD)')
                ? dollarValueFormatter(item.value)
                : item.value,
            colour: item.color,
        }))

        return <TooltipContent title={title} items={items} />
    }

    return (
        <>
            <div className="space-y-2">
                {showLegendButton && (
                    <button
                        onClick={() => setShowLegend(!showLegend)}
                        className={`${
                            showLegend
                                ? 'bg-brand-teal-600 hover:bg-brand-teal-700 text-white shadow'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-600'
                        }  p-2 rounded-lg text-sm font-medium leading-5 flex gap-2 items-center`}
                    >
                        Legend
                        <ChevronDownIcon
                            className={`${
                                showLegend && 'rotate-180'
                            } transition duration-300 h-5 w-5`}
                            aria-hidden="true"
                        />
                    </button>
                )}
                <AnimateHeight duration={300} height={showLegend ? 'auto' : 0}>
                    <Legend
                        categories={researchCategories.map(
                            category => category.label
                        )}
                        colours={researchCategories.map(
                            ({ value }) => researchCategoryColours[value]
                        )}
                        customWrapperClasses="grid grid-cols-1 gap-2 lg:grid-cols-3"
                        customTextClasses="whitespace-normal"
                    />
                </AnimateHeight>
            </div>

            <ResponsiveContainer width="100%" height={500}>
                <RechartScatterChart
                    margin={{
                        top: 30,
                        right: 30,
                        bottom: 30,
                        left: 30,
                    }}
                >
                    <CartesianGrid />

                    <XAxis
                        type="number"
                        dataKey="Total Grants"
                        allowDecimals={false}
                        label={{
                            value: 'Grants',
                            position: 'bottom',
                        }}
                        className="text-lg"
                    />

                    <YAxis
                        type="number"
                        dataKey="Known Financial Commitments (USD)"
                        tickFormatter={axisDollarFormatter}
                        label={{
                            value: 'Known Financial Commitments (USD)',
                            position: 'left',
                            angle: -90,
                            style: { textAnchor: 'middle' },
                            offset: 20,
                        }}
                        className="text-lg"
                    />

                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={tooltipContent}
                        {...baseTooltipProps}
                    />

                    <Scatter data={chartData} shape={<CustomDot />}>
                        {chartData.map((datum: any, index: number) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    researchCategoryColours[
                                        datum['Category Value']
                                    ]
                                }
                            />
                        ))}
                    </Scatter>
                </RechartScatterChart>
            </ResponsiveContainer>
        </>
    )
}
