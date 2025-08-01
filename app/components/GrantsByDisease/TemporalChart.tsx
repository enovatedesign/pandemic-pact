import { useContext, useState } from 'react'
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
import { filter, groupBy } from 'lodash'
import ImageExportLegend from '../ImageExportLegend'
import { axisDollarFormatter } from '../../helpers/value-formatters'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { GlobalFilterContext } from '../../helpers/filters'
import selectOptions from '../../../data/dist/select-options.json'
import { diseaseColours } from '../../helpers/colours'
import { rechartBaseTooltipProps } from '../../helpers/tooltip'
import Switch from '../Switch'
import RadioGroup from '../RadioGroup'
import NoDataText from '../NoData/NoDataText'
import { grantsByDiseaseFallbackData } from '../NoData/visualisationFallbackData'

interface TemporalChartProps {
    outbreak?: boolean
}

export default function TemporalChart({outbreak}: TemporalChartProps) {
    const [hideCovid, setHideCovid] = useState(false)
    
    const { temporalFallback } = grantsByDiseaseFallbackData

    const [
        displayKnownFinancialCommitments,
        setDisplayKnownFinancialCommitments,
    ] = useState(false)

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
    
    let chartData = Object.keys(datasetGroupedByYear).map(year => {
        const grants = datasetGroupedByYear[year]

        let dataPoint: { [key: string]: string | number } = { year }

        selectOptions.Diseases.forEach(({ value, label }) => {
            const filteredGrants = grants.filter(grant =>
                grant['Diseases'].includes(value)
            )

            const valueToUse = displayKnownFinancialCommitments
                ? filteredGrants.reduce(...sumNumericGrantAmounts)
                : filteredGrants.length

            if (valueToUse > 0) {
                dataPoint[label] = valueToUse
            }
        })

        return dataPoint
    })

    if (hideCovid) {
        chartData.forEach(dataPoint => {
            delete dataPoint['COVID-19']
        })
    }

    const tickFormatter = (value: any) =>
        displayKnownFinancialCommitments
            ? axisDollarFormatter(value)
            : value.toString()

    if (chartData.length  === 0) chartData = temporalFallback
    
    const controlsWrapperClasses = [
        'w-full flex flex-col gap-y-2 lg:gap-y-0 lg:flex-row lg:justify-between items-center ignore-in-image-export',
        chartData === temporalFallback && 'blur-md'
    ].filter(Boolean).join(' ')

    const responsiveContainerClasses = [
        'z-10',
         chartData === temporalFallback && 'blur-md'
    ].filter(Boolean).join(' ')
    
    const diseaseLines = selectOptions['Diseases']
        .filter(({ label }) => 
            label !== 'Other' && 
            label !== 'Unspecified'
        )
    
    return (
        <>
            <div className={controlsWrapperClasses}>
                {!outbreak && (
                    <Switch
                        checked={hideCovid}
                        onChange={setHideCovid}
                        label="Hide COVID-19"
                        theme="light"
                    />
                )}

                <RadioGroup<boolean>
                    options={[
                        { label: 'Number of grants', value: false },
                        {
                            label: 'Known financial commitments (USD)',
                            value: true,
                        },
                    ]}
                    value={displayKnownFinancialCommitments}
                    onChange={setDisplayKnownFinancialCommitments}
                />
            </div>
        
            <ResponsiveContainer width="100%" height={500} className={responsiveContainerClasses}>
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

                    {chartData !== temporalFallback && (
                        <Tooltip
                            content={props => (
                                <RechartTrendsTooltipContent
                                    props={props}
                                    chartData={chartData}
                                    formatValuesToDollars={displayKnownFinancialCommitments}
                                />
                            )}
                            {...rechartBaseTooltipProps}
                        />
                    )}

                    {diseaseLines.map(({ value, label }) => (
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
                categories={selectOptions.Diseases.map(({ label }) => label)}
                colours={selectOptions.Diseases.map(
                    ({ value }) => diseaseColours[value]
                )}
            />

            {chartData === temporalFallback && <NoDataText/>}
        </>
    )
}
