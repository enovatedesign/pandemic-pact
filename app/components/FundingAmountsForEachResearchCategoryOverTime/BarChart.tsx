import {
    BarChart as RechartBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

import { ChartProps } from './types'
import { allResearchCategoriesColour, researchCategoryColours } from '@/app/helpers/colours'
import { rechartBaseTooltipProps } from '@/app/helpers/tooltip'
import { axisDollarFormatter } from '@/app/helpers/value-formatters'
import { fundingAmountsForEachResearchCategoryOverTimeFallback } from '../NoData/visualisationFallbackData'

import RechartTrendsTooltipContent from '../RechartTrendsTooltipContent'
import NoDataText from '../NoData/NoDataText'

const BarChart = ({
    data,
    categories,
    showingAllResearchCategories,
    imageExportLegend,
}: ChartProps) => {
    const responsiveContainerWrapperClasses = [
        'w-full',
        data === fundingAmountsForEachResearchCategoryOverTimeFallback && 'blur-md'
    ].filter(Boolean).join(' ')
    
    return (
        <div className="w-full">
            <div className={responsiveContainerWrapperClasses}>  
                <ResponsiveContainer width="100%" height={500}>
                    <RechartBarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="year"
                            label={{
                                value: 'Year of Award Start',
                                position: 'bottom',
                                offset: 0,
                            }}
                        />

                        <YAxis
                            tickFormatter={axisDollarFormatter}
                            label={{
                                value: 'Known Financial Commitments (USD)',
                                position: 'left',
                                angle: -90,
                                style: { textAnchor: 'middle' },
                                offset: 10,
                            }}
                        />
                        {data !== fundingAmountsForEachResearchCategoryOverTimeFallback && (
                            <Tooltip
                                content={props => (
                                    <RechartTrendsTooltipContent
                                        props={props}
                                        chartData={data}
                                        formatValuesToDollars
                                    />
                                )}
                                {...rechartBaseTooltipProps}

                            />
                        )}

                        {categories.map(({ value, label }) => (
                            <Bar
                                key={`bar-${value}`}
                                dataKey={label}
                                fill={
                                    showingAllResearchCategories
                                        ? allResearchCategoriesColour
                                        : researchCategoryColours[value]
                                }
                            />
                        ))}
                    </RechartBarChart>
                </ResponsiveContainer>

                {imageExportLegend}
            </div>

            {data === fundingAmountsForEachResearchCategoryOverTimeFallback && <NoDataText/>}
        </div>
    )
}

export default BarChart