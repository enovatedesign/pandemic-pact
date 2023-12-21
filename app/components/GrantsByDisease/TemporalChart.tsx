import {useContext} from "react"
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts'
import {groupBy} from 'lodash'
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {GlobalFilterContext} from "../../helpers/filter"
import selectOptions from "../../../data/dist/select-options.json"

export default function TemporalChart() {
    const {grants} = useContext(GlobalFilterContext)

    const datasetGroupedByYear = groupBy(
        grants.filter((grants: any) => grants.GrantStartYear?.match(/^\d{4}$/)),
        'GrantStartYear',
    )

    const amountCommittedToEachDiseaseOverTime = Object.keys(
        datasetGroupedByYear
    ).map(year => {
        const grants = datasetGroupedByYear[year]

        let dataPoint: {[key: string]: string | number} = {year}

        selectOptions.Disease.forEach(({value, label}) => {
            dataPoint[label] = grants
                .filter(grant => grant.Disease.includes(value))
                .reduce(...sumNumericGrantAmounts)
        })

        return dataPoint
    })

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
        <ResponsiveContainer width="100%" height={700}>
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
                        value: "Year",
                        position: "bottom",
                        offset: 0,
                    }}
                    className="text-lg"
                />

                <YAxis
                    type="number"
                    tickFormatter={dollarValueFormatter}
                    label={{
                        value: "Known Financial Commitments (USD)",
                        position: "left",
                        angle: -90,
                        style: {textAnchor: 'middle'},
                        offset: 20,
                    }}
                    className="text-lg"
                />

                <Tooltip
                    formatter={dollarValueFormatter}
                    isAnimationActive={false}
                />

                {selectOptions.Disease.map(({label}, index) => (
                    <Line
                        key={label}
                        type="monotone"
                        dataKey={label}
                        stroke={colours[index % colours.length]}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}
