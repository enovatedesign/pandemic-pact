import {
    LineChart as RechartLineChart,
    Line,
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


const LineChart = ({
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
                    <RechartLineChart
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 20,
                        }}
                        data={data}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            type="category"
                            dataKey="year"
                            label={{
                                value: 'Year',
                                position: 'bottom',
                                offset: 0,
                            }}
                        />

                        <YAxis
                            type="number"
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
                            <Line
                                key={`line-${value}`}
                                dataKey={label}
                                stroke={
                                    showingAllResearchCategories
                                        ? allResearchCategoriesColour
                                        : researchCategoryColours[value]
                                }
                                strokeWidth={2}
                            />
                        ))}
                    </RechartLineChart>
                </ResponsiveContainer>

                {imageExportLegend}
            </div>
            
            {data === fundingAmountsForEachResearchCategoryOverTimeFallback && <NoDataText/>}

        </div>
    )
}

export default LineChart