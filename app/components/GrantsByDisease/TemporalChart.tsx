import { useState, useContext } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import TooltipContent from '../TooltipContent'
import { groupBy } from 'lodash'
import {
    dollarValueFormatter,
    axisDollarFormatter,
} from '../../helpers/value-formatters'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { GlobalFilterContext } from '../../helpers/filters'
import selectOptions from '../../../data/dist/select-options.json'
import { diseaseColours } from '../../helpers/colours'
import { rechartBaseTooltipProps } from '../../helpers/tooltip'

interface Props {
    hideCovid: boolean
}

export default function TemporalChart({ hideCovid }: Props) {
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

    if (hideCovid) {
        amountCommittedToEachDiseaseOverTime.forEach(dataPoint => {
            delete dataPoint['COVID-19']
        })
    }

    const tooltipContent = (props: any) => {
        if (!props.active) return null

        // Sort tooltip items by descending dollar value, so highest is at the top
        props.payload.sort(
            (a: { value: number }, b: { value: number }) => b.value - a.value
        )

        const years = amountCommittedToEachDiseaseOverTime
            .map(item => item.year)
            .sort()

        const items = props.payload.map((item: any) => {
            let trend = undefined

            const year = item.payload.year

            const yearIndex = years.indexOf(year)

            if (yearIndex > 0) {
                const previousYear = years[yearIndex - 1]

                const previousYearObject =
                    amountCommittedToEachDiseaseOverTime.find(
                        item => item.year === previousYear
                    )

                const previousYearValue = previousYearObject
                    ? previousYearObject[item.dataKey]
                    : 0

                if (item.value > previousYearValue) {
                    trend = 'up'
                } else if (item.value < previousYearValue) {
                    trend = 'down'
                } else {
                    trend = 'none'
                }
            }

            return {
                label: item.name,
                value: dollarValueFormatter(item.value),
                colour: item.color,
                trend,
            }
        })

        return <TooltipContent title={props.label} items={items} />
    }

    return (
        <>
            <ResponsiveContainer width="100%" height={500} className="z-10">
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
                        content={tooltipContent}
                        {...rechartBaseTooltipProps}
                    />

                    {selectOptions.Disease.map(({ value, label }) => (
                        <Line
                            key={label}
                            dataKey={label}
                            stroke={diseaseColours[value]}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </>
    )
}
