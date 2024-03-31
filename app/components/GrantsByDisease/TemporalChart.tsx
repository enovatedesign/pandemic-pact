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
import { groupBy } from 'lodash'
import { rechartCategoriesTooltipContentFunction } from '../RechartCategoriesTooltipContent'
import ImageExportLegend from '../ImageExportLegend'
import { axisDollarFormatter } from '../../helpers/value-formatters'
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
                        content={props =>
                            rechartCategoriesTooltipContentFunction({
                                ...props,
                                category: 'Disease',
                            })
                        }
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

            <ImageExportLegend
                categories={selectOptions.Disease.map(({ label }) => label)}
                colours={selectOptions.Disease.map(
                    ({ value }) => diseaseColours[value]
                )}
            />
        </>
    )
}
