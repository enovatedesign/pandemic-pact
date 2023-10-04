import {BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

interface Props {
    colourScale: any
}

export default function ColourScale({colourScale}: Props) {
    const ticks = colourScale.ticks(5)

    const step = ticks[1] - ticks[0]

    const bars: any = ticks.map((tick: any, index: number) => ({
        name: `tick-${tick}`,
        value: step,
        colour: colourScale(tick),
    }))

    const chartData: any = [
        Object.fromEntries(bars.map((bar: any) => [bar.name, bar.value])),
    ]

    return (
        <BarChart
            width={300}
            height={80}
            layout="vertical"
            data={chartData}
        >
            <XAxis
                type="number"
                ticks={ticks}
                tickLine={false}
                axisLine={false}
            />

            <YAxis
                type="category"
                dataKey="name"
                hide
            />

            {bars.map((bar: any) => (
                <Bar
                    key={bar.name}
                    stackId="a"
                    dataKey={bar.name}
                    fill={bar.colour}
                />
            ))}
        </BarChart>
    )
}
