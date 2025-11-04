import { useContext, MouseEvent } from 'react'
import {
    BarChart as RechartBarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from 'recharts'

import { dollarValueFormatter } from '../../helpers/value-formatters'
import { TooltipContext } from '../../helpers/tooltip'
import { BarListContext } from '../../helpers/bar-list'
import TooltipContent from '../TooltipContent'

interface Props {
    dataIndex: number
}

export default function BarListRow({ dataIndex }: Props) {
    const { tooltipRef } = useContext(TooltipContext)

    const {
        data,
        brightColours,
        dimColours,
        maxTotalNumberOfGrants,
        maxAmountCommitted,
    } = useContext(BarListContext)

    const datum = data[dataIndex]
    
    const onChartMouseEnterOrMove = (
        nextState: any,
        event: MouseEvent<SVGPathElement>
    ) => {
        if (nextState?.activePayload) {
            tooltipRef?.current?.open({
                position: {
                    x: event.clientX,
                    y: event.clientY,
                },
                content: <BarListRowTooltipContent nextState={nextState} />,
            })
        } else {
            onChartMouseLeave()
        }
    }

    const onChartMouseLeave = () => {
        tooltipRef?.current?.close()
    }
    
    return (
        <>
            <div className="col-span-3 md:col-span-1">
                <ResponsiveContainer width="100%" height={20}>
                    <RechartBarChart
                        data={[datum]}
                        layout="vertical"
                        margin={{
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                        }}
                        onMouseEnter={(nextState, event) =>
                            onChartMouseEnterOrMove(nextState, event)
                        }
                        onMouseMove={(nextState, event) =>
                            onChartMouseEnterOrMove(nextState, event)
                        }
                        onMouseLeave={onChartMouseLeave}
                    >
                        <XAxis
                            type="number"
                            hide={true}
                            domain={[0, maxTotalNumberOfGrants]}
                        />

                        <YAxis
                            type="category"
                            dataKey={'Category Label'}
                            axisLine={false}
                            tickLine={false}
                            hide={true}
                        />

                        <Bar
                            dataKey="Grants With Known Financial Commitments"
                            fill={brightColours[datum['Category Value']]}
                            stackId="a"
                            background={{ fill: '#eee' }}
                        />
                        
                        <Bar
                            dataKey="Grants With Unspecified Financial Commitments"
                            fill={dimColours[datum['Category Value']]}
                            stackId="a"
                        />
                    </RechartBarChart>
                </ResponsiveContainer>
            </div>

            <div className="self-center pl-2 md:pr-6 col-span-1 md:col-span-1 justify-self-end">
                <p className="total-grants-number text-xs text-gray-600">{datum['Total Grants']}</p>
            </div>

            <div className="col-span-3 md:col-span-1">
                <ResponsiveContainer width="100%" height={20}>
                    <RechartBarChart
                        data={[datum]}
                        layout="vertical"
                        margin={{
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                        }}
                        onMouseEnter={(nextState, event) =>
                            onChartMouseEnterOrMove(nextState, event)
                        }
                        onMouseMove={(nextState, event) =>
                            onChartMouseEnterOrMove(nextState, event)
                        }
                        onMouseLeave={onChartMouseLeave}
                    >
                        <XAxis
                            type="number"
                            hide={true}
                            domain={[0, maxAmountCommitted]}
                        />

                        <YAxis
                            type="category"
                            dataKey={'Category Label'}
                            axisLine={false}
                            tickLine={false}
                            hide={true}
                        />

                        <Bar
                            dataKey="Known Financial Commitments (USD)"
                            fill={brightColours[datum['Category Value']]}
                            background={{ fill: '#eee' }}
                        />
                    </RechartBarChart>
                </ResponsiveContainer>
            </div>

            <div className="self-center pl-2 col-span-1 md:col-span-1 justify-self-end">
                <p className="dollar-amount-text text-xs text-gray-600">
                    {dollarValueFormatter(
                        datum['Known Financial Commitments (USD)']
                    )}
                </p>
            </div>
        </>
    )
}

function BarListRowTooltipContent({ nextState }: any) {
    const items = nextState.activePayload.map((payload: any) => ({
        label: payload.name,
        value:
            payload.dataKey === 'Known Financial Commitments (USD)'
                ? dollarValueFormatter(payload.value)
                : payload.value,
        colour: payload.color,
    }))

    return <TooltipContent items={items} />
}
