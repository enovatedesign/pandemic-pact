import {useContext} from "react"
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts'
import {groupBy} from 'lodash'
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {GlobalFilterContext} from "../../helpers/filter"
import selectOptions from "../../../data/dist/select-options.json"
import {diseaseColours} from "../../helpers/colours"

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

                {selectOptions.Disease.map(({value, label}) => (
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
