import { BarChart, Bar, Cell, XAxis, YAxis } from 'recharts'
import { axisDollarFormatter } from '@/app/helpers/value-formatters'

interface Props {
    colourScale: any
    displayUsingKnownFinancialCommitments: boolean
}

export default function ColourScale({
    colourScale,
    displayUsingKnownFinancialCommitments,
}: Props) {
    const ticks = colourScale.ticks()

    const tickFormat = colourScale.tickFormat(6, 'd')

    const chartData = ticks
        .map(tickFormat)
        .filter((value: string) => value !== '')
        .map((value: string) => ({
            name: value,
            amount: 100,
            colour: colourScale(value),
        }))

    return (
        <BarChart
            width={400}
            height={60}
            data={chartData}
            barGap={0}
            barCategoryGap={0}
        >
            <XAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
            />

            {/* 
                Note that we can't just use the `hide` prop on the y-axis because
                that causes the first tick on the x-axis (e.g. the `0`) to be
                hidden as well. So we have to use the `tickLine`, `axisLine` and
                `width` props to hide the y-axis.
            */}

            <YAxis width={1} axisLine={false} tickLine={false} />

            <Bar
                type="category"
                dataKey="amount"
                fill="blue"
                isAnimationActive={false}
            >
                {chartData.map((datum: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={datum.colour} />
                ))}
            </Bar>
        </BarChart>
    )
}
