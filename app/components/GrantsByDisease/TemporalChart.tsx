import { useContext } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { groupBy } from 'lodash'
import {
    dollarValueFormatter,
    axisDollarFormatter,
} from '../../helpers/value-formatters'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { GlobalFilterContext } from '../../helpers/filters'
import selectOptions from '../../../data/dist/select-options.json'
import { diseaseColours } from '../../helpers/colours'
import { baseTooltipProps } from '../../helpers/tooltip'

export default function TemporalChart() {
    const { grants } = useContext(GlobalFilterContext)

    const datasetGroupedByYear = groupBy(
        grants.filter(
            (grant: any) =>
                grant?.TrendStartYear &&
                !isNaN(grant.TrendStartYear) &&
                grant.TrendStartYear >= 2020
        ),
        'TrendStartYear'
    )

    const amountCommittedToEachDiseaseOverTime = Object.keys(
        datasetGroupedByYear
    ).map(year => {
        const grants = datasetGroupedByYear[year]

        let dataPoint: { [key: string]: string | number } = { year }

        selectOptions.Disease.forEach(({ value, label }) => {
            dataPoint[label] = grants
                .filter(grant => grant.Disease.includes(value))
                .reduce(...sumNumericGrantAmounts)
        })

        return dataPoint
    })

    return (
        <ResponsiveContainer width="100%" height={500}>
            <LineChart
                margin={{
                    top: 5,
                    right: 30,
                    left: 30,
                    bottom: 20,
                }}
                data={amountCommittedToEachDiseaseOverTime}
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
                    isAnimationActive={false}
                    content={props => (
                        <TooltipContent
                            active={props.active}
                            payload={props.payload}
                            label={props.label}
                        />
                    )}
                    {...baseTooltipProps}
                />

                {selectOptions.Disease.map(({ value, label }) => (
                    <Line
                        key={label}
                        type="monotone"
                        dataKey={label}
                        stroke={diseaseColours[value]}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}

function TooltipContent({
    active,
    payload,
    label,
}: {
    active?: boolean
    payload: any
    label: string
}) {
    if (!active) return null

    // Sort tooltip items by descending dollar value, so highest is at the top
    payload.sort(
        (a: { value: number }, b: { value: number }) => b.value - a.value
    )

    return (
        <div className="rounded-lg text-sm border bg-white opacity-100 shadow border-gray-100 ">
            <div className="border-gray-100 border-b px-4 py-2">
                <p className="font-medium text-gray-700">{label}</p>
            </div>

            <div className="px-4 py-2 space-y-1">
                {payload.map((item: any, index: number) => (
                    <div className="flex items-center justify-between space-x-8">
                        <div className="flex items-center space-x-2">
                            <span
                                className="shrink-0 rounded-full border-2 h-3 w-3 border-white shadow"
                                style={{ backgroundColor: item.color }}
                            />

                            <p className="text-right whitespace-nowrap text-gray-400">
                                {item.name}
                            </p>
                        </div>

                        <p className="font-medium tabular-nums text-right whitespace-nowrap text-gray-700">
                            {dollarValueFormatter(item.value)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
