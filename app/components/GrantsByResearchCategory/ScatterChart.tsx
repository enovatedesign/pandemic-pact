import {ScatterChart as RechartScatterChart, Scatter, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Label} from 'recharts';
import {dollarValueFormatter} from "../../helpers/value-formatters"

interface Props {
    chartData: any,
}

export default function ScatterChart({chartData}: Props) {
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
        <ResponsiveContainer width="100%" height={800}>
            <RechartScatterChart
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                }}
            >
                <CartesianGrid />

                <XAxis
                    type="number"
                    dataKey="Total Number Of Grants"
                    allowDecimals={false}
                    label={{
                        value: "Grants",
                        position: "bottom",
                    }}
                />

                <YAxis
                    type="number"
                    dataKey="Known Financial Commitments"
                    tickFormatter={dollarValueFormatter}
                    label={{
                        value: "Known Financial Commitments (USD)",
                        position: "left",
                        angle: -90,
                        style: {textAnchor: 'middle'},
                        offset: 10,
                    }}
                />

                <Tooltip
                    isAnimationActive={false}
                    cursor={{strokeDasharray: '3 3'}}
                    formatter={(value: any, name: any, props: any) => {
                        if (name.includes("Amount Committed")) {
                            return [
                                dollarValueFormatter(value),
                                "Known Financial Commitments",
                                props,
                            ]
                        }
                
                        return [value, name, props]
                    }}
                />

                <Scatter
                    data={chartData}
                    fill="#8884d8"
                >
                    {chartData.map((_: any, index: number) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={colours[index % colours.length]}
                        />
                    ))}
                </Scatter>
            </RechartScatterChart >
        </ResponsiveContainer >
    )
}
