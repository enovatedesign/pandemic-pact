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
import RechartTrendsTooltipContent from '../RechartTrendsTooltipContent'
import { groupBy } from 'lodash'
import ImageExportLegend from '../ImageExportLegend'
import { axisDollarFormatter } from '../../helpers/value-formatters'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { GlobalFilterContext } from '../../helpers/filters'
import selectOptions from '../../../data/dist/select-options.json'
import { diseaseColours } from '../../helpers/colours'
import { rechartBaseTooltipProps } from '../../helpers/tooltip'

interface Props {
    hideCovid: boolean
    displayKnownFinancialCommitments: boolean
}

export default function TemporalChart({
    hideCovid,
    displayKnownFinancialCommitments,
}: Props) {
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

    const chartData = Object.keys(datasetGroupedByYear).map(year => {
        const grants = datasetGroupedByYear[year]

        let dataPoint: { [key: string]: string | number } = { year }

        selectOptions.Disease.forEach(({ value, label }) => {
            const filteredGrants = grants.filter(grant =>
                grant.Disease.includes(value)
            )

            dataPoint[label] = displayKnownFinancialCommitments
                ? filteredGrants.reduce(...sumNumericGrantAmounts)
                : filteredGrants.length
        })

        return dataPoint
    })

    if (hideCovid) {
        chartData.forEach(dataPoint => {
            delete dataPoint['COVID-19']
        })
    }

    const tickFormatter = (value: any, index: number) =>
        displayKnownFinancialCommitments
            ? axisDollarFormatter(value)
            : value.toString()

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
                        label={{
                            value: displayKnownFinancialCommitments
                                ? 'Known Financial Commitments (USD)'
                                : 'Number of grants',
                            position: 'left',
                            angle: -90,
                            style: { textAnchor: 'middle' },
                            offset: 20,
                        }}
                        className="text-lg"
                    />

                    <Tooltip
                        content={props => (
                            <RechartTrendsTooltipContent
                                props={props}
                                chartData={chartData}
                                displayKnownFinancialCommitments={
                                    displayKnownFinancialCommitments
                                }
                            />
                        )}
                        {...rechartBaseTooltipProps}
                    />

                    {selectOptions.Disease.map(({ value, label }) => (
                        <Line
                            key={label}
                            dataKey={label}
                            stroke={diseaseColours[value]}
                            strokeWidth={2}
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
