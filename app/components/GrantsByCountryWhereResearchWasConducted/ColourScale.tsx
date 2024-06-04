import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { axisDollarFormatter } from '@/app/helpers/value-formatters'

interface Props {
    colourScale: any
    displayKnownFinancialCommitments: boolean
}

export default function ColourScale({
    colourScale,
    displayKnownFinancialCommitments,
}: Props) {
    const ticks = colourScale.ticks(5)

    const step = ticks[1] - ticks[0]

    const bars: any = ticks.map((tick: any) => ({
        name: `tick-${tick}`,
        value: step,
        colour: colourScale(tick),
    }))

    const chartData: any = [
        Object.fromEntries(bars.map((bar: any) => [bar.name, bar.value])),
    ]

    const tickFormatter = (value: any) =>
        displayKnownFinancialCommitments
            ? axisDollarFormatter(value)
            : value.toString()

    return (
        <BarChart width={300} height={60} layout="vertical" data={chartData}>
            <XAxis
                tickFormatter={tickFormatter}
                type="number"
                ticks={ticks}
                tickLine={false}
                axisLine={false}
            />

            {/* 
                Note that we can't just use the `hide` prop on the y-axis because
                that causes the first tick on the x-axis (e.g. the `0`) to be
                hidden as well. So we have to use the `tickLine`, `axisLine` and
                `width` props to hide the y-axis.
            */}
            <YAxis
                type="category"
                dataKey="name"
                width={1}
                axisLine={false}
                tickLine={false}
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
