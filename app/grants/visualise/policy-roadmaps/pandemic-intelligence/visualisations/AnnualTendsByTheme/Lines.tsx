import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip } from "recharts"

import { rechartBaseTooltipProps } from "@/app/helpers/tooltip"
import { pandemicIntelligenceThemeColours } from "@/app/helpers/colours"
import { AnnualTrendsChartData, AxisLabel } from "./types"
import { SelectOption } from "@/scripts/types/generate"

import RechartTrendsTooltipContent from "@/app/components/RechartTrendsTooltipContent"

interface Props {
    chartData: AnnualTrendsChartData
    tickFormatter: any
    lines: SelectOption[]
    displayKnownFinancialCommitments: boolean
    yAxisLabel: AxisLabel
}

const Lines = ({
    chartData,
    tickFormatter,
    lines,
    displayKnownFinancialCommitments,
    yAxisLabel
}: Props) => (
    <ResponsiveContainer width="100%" height={500}>
        <LineChart
            width={800}
            height={500}
            margin={{
                top: 5,
                right: 30,
                left: 30,
                bottom: 20,
            }}
            data={chartData}
        >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
                type="category"
                dataKey="year"
                label={{
                    value: 'Year of Award Start',
                    position: 'bottom',
                    offset: 0,
                }}
                className="text-lg"
            />

            <YAxis
                type="number"
                tickFormatter={tickFormatter}
                label={yAxisLabel}
                className="text-lg"
            />

            <Tooltip
                content={(props: unknown) => (
                    <RechartTrendsTooltipContent
                        props={props}
                        chartData={chartData}
                        formatValuesToDollars={displayKnownFinancialCommitments}
                    />
                )}
                {...rechartBaseTooltipProps}
            />

            {lines.map(({ value, label }) => (
                <Line
                    key={label}
                    dataKey={label}
                    stroke={pandemicIntelligenceThemeColours[value]}
                    strokeWidth={2}
                />
            ))}
        </LineChart>
    </ResponsiveContainer>
)

export default Lines