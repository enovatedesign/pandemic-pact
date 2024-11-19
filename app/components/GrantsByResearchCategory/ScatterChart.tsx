'use client'

import { useContext, useMemo, useState } from 'react'
import AnimateHeight from 'react-animate-height'
import {
    ScatterChart as RechartScatterChart,
    Scatter,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from 'recharts'
import { ChevronDownIcon } from '@heroicons/react/solid'

import selectOptions from '../../../data/dist/select-options.json'
import { rechartBaseTooltipProps } from '../../helpers/tooltip'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { researchCategoryColours } from '../../helpers/colours'
import {
    dollarValueFormatter,
    axisDollarFormatter,
} from '../../helpers/value-formatters'
import { GlobalFilterContext } from '../../helpers/filters'
import { grantsByResearchCategoriesFallbackData } from '../NoData/visualisationFallbackData'
import { isChartDataUnavailable } from '@/app/helpers/bar-list'

import Legend from '../Legend'
import ImageExportLegend from '../ImageExportLegend'
import TooltipContent from '../TooltipContent'
import NoDataText from '../NoData/NoDataText'

const CustomDot = (props: any) => {
    const { cx, cy, fill } = props
    return <circle cx={cx} cy={cy} r={6} fill={fill} />
}

export default function ScatterChart() {
    const { grants } = useContext(GlobalFilterContext)

    const { scatterFallback } = grantsByResearchCategoriesFallbackData

    const [showLegend, setShowLegend] = useState<boolean>(false)

    const { chartData, researchCategories } = useMemo(() => {
        const chartData = selectOptions.ResearchCat.map(
            function (researchCategory) {
                const grantsWithKnownAmounts = grants
                    .filter((grant: any) =>
                        grant.ResearchCat.includes(researchCategory.value),
                    )
                    .filter(
                        (grant: any) =>
                            typeof grant.GrantAmountConverted === 'number',
                    )

                const grantsWithUnspecifiedAmounts = grants
                    .filter((grant: any) =>
                        grant.ResearchCat.includes(researchCategory.value),
                    )
                    .filter(
                        (grant: any) =>
                            typeof grant.GrantAmountConverted !== 'number',
                    )

                const moneyCommitted = grantsWithKnownAmounts.reduce(
                    ...sumNumericGrantAmounts,
                )

                return {
                    'Category Value': researchCategory.value,
                    'Category Label': researchCategory.label,
                    'Grants With Known Financial Commitments':
                        grantsWithKnownAmounts.length,
                    'Grants With Unspecified Financial Commitments':
                        grantsWithUnspecifiedAmounts.length,
                    'Total Grants':
                        grantsWithKnownAmounts.length +
                        grantsWithUnspecifiedAmounts.length,
                    'Known Financial Commitments (USD)': moneyCommitted,
                }
            },
        )

        const researchCategories = chartData.map(data => ({
            label: data['Category Label'],
            value: data['Category Value'],
        }))

        return { chartData, researchCategories }
    }, [grants])

    const tooltipContent = (props: any) => {
        const { active, payload } = props

        if (!active) return null

        const title = payload[0].payload['Category Label']

        const items = payload.map((item: any) => ({
            label: item.name,
            value: item.name.includes('(USD)')
                ? dollarValueFormatter(item.value)
                : item.value,
            colour: item.color,
        }))

        return <TooltipContent title={title} items={items} />
    }
    
    const scatterChartDataIsNotAvailable = isChartDataUnavailable(chartData)
    
    const scatterChartData = scatterChartDataIsNotAvailable ? scatterFallback : chartData

    const responsiveContainerWrapperClasses = [
        'w-full',
        scatterChartData === scatterFallback && 'blur-md'
    ].filter(Boolean).join(' ')
    return (
        <div className="w-full relative">
            <div className="space-y-2 ignore-in-image-export">
                <button
                    onClick={() => setShowLegend(!showLegend)}
                    className={`${
                        showLegend
                            ? 'bg-brand-teal-600 hover:bg-brand-teal-700 text-white shadow'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-600'
                    }  p-2 rounded-lg text-sm font-medium leading-5 flex gap-2 items-center`}
                >
                    Legend
                    <ChevronDownIcon
                        className={`${
                            showLegend && 'rotate-180'
                        } transition duration-300 h-5 w-5`}
                        aria-hidden="true"
                    />
                </button>
                
                {researchCategories.length > 0 && (
                    <AnimateHeight duration={300} height={showLegend ? 'auto' : 0}>
                        <Legend
                            categories={researchCategories.map(
                                category => category.label,
                            )}
                            colours={researchCategories.map(
                                ({ value }) => researchCategoryColours[value],
                            )}
                            customWrapperClasses="grid grid-cols-1 gap-2 lg:grid-cols-3"
                            customTextClasses="whitespace-normal"
                        />
                    </AnimateHeight>
                )}
            </div>
            
            <div className={responsiveContainerWrapperClasses}>
                <ResponsiveContainer width="100%" height={500}>
                    <RechartScatterChart
                        margin={{
                            top: 30,
                            right: 30,
                            bottom: 30,
                            left: 30,
                        }}
                    >
                        <CartesianGrid />

                        <XAxis
                            type="number"
                            dataKey="Total Grants"
                            allowDecimals={false}
                            label={{
                                value: 'Grants',
                                position: 'bottom',
                            }}
                            className="text-lg"
                        />

                        <YAxis
                            type="number"
                            dataKey="Known Financial Commitments (USD)"
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

                        {scatterChartData !== scatterFallback && (
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={tooltipContent}
                                {...rechartBaseTooltipProps}
                            />
                        )}

                        <Scatter data={scatterChartData} shape={<CustomDot />}>
                            {scatterChartData.map((datum: any, index: number) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        researchCategoryColours[
                                            datum['Category Value']
                                        ]
                                    }
                                />
                            ))}
                        </Scatter>
                    </RechartScatterChart>
                </ResponsiveContainer>
            </div>

            <ImageExportLegend
                categories={researchCategories.map(category => category.label)}
                colours={researchCategories.map(
                    ({ value }) => researchCategoryColours[value],
                )}
            />

            {scatterChartData === scatterFallback && <NoDataText/>}
        </div>
    )
}
