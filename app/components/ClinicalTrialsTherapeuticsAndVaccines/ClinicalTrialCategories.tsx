import { useContext, MouseEvent } from 'react'
import {
    BarChart as RechartBarChart,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Bar,
} from 'recharts'

import { TooltipContext } from '../../helpers/tooltip'
import { categoryColours } from '@/app/helpers/colours'
import { dollarValueFormatter } from '@/app/helpers/value-formatters'
import { isClinicalTrialCategoryDataUnavailable } from '@/app/helpers/bar-list'
import { clinicalTrialCategoriesFallbackData } from '../NoData/visualisationFallbackData'

import TooltipContent from '../TooltipContent'
import InfoModal from '../InfoModal'
import NoDataText from '../NoData/NoDataText'

interface Props {
    chartData: Record<string, Record<string, any>>
}

const ClinicalTrialCategories = ({
    chartData,
}: Props) => {
    const { tooltipRef } = useContext(TooltipContext)

    let data = { ...chartData }
    
    const onChartMouseEnterOrMove = (
        nextState: any,
        event: MouseEvent<SVGPathElement>,
        formatToDollar: boolean = false
    ) => {
        if (nextState?.activePayload) {
            tooltipRef?.current?.open({
                position: {
                    x: event.clientX,
                    y: event.clientY,
                },
                content: <BarListRowTooltipContent nextState={nextState} formatToDollar={formatToDollar} noChartData={noChartData} />,
            })
        } else {
            onChartMouseLeave()
        }
    }

    const onChartMouseLeave = () => {
        tooltipRef?.current?.close()
    }
    
    // Destructure chart data while mapping only numerical values to calculate the max value
    const calculateMaxNumber = (dataset: any) => (
        Math.max(...Object.values(dataset)
            .flatMap((category: any) => 
                Object.values(category).filter((value): value is number => 
                    typeof value === "number"
                )
            )
        )
    )
    
    // Find the total value of the bars in the data
    const calculateHighestValue = (values: number[]) => {
        return values.filter((value) => 
            typeof value === "number"
        )
        .reduce((sum: number, num: number) => sum + num, 0)
    }

    // Find the key with the highest numerical value
    // This is to add the background fill to the length of the bar
    const findKeyWithHighestValue = (data: any[]) => (
        Object.entries(data)
            .filter(([_, value]) => typeof value === "number")
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .map(([key]) => key)[0]
    )

    // Filter out category label and the key with the highest value to stack in the bar
    const calculateRemainingBarsList = (keys: string[], keyWithHighestValue: string) => (
        keys.filter(key => 
            key !== 'Category Label' &&
            key !== keyWithHighestValue
        )
    )

    const totalGrantsChartDataIsNotAvailable = isClinicalTrialCategoryDataUnavailable(Object.values(chartData.totalGrantsCategoryData))
    const totalFinancialCommitmentsCategoryDataIsNotAvailable = isClinicalTrialCategoryDataUnavailable(Object.values(chartData.totalFinancialCommitmentsCategoryData))

    let noChartData = (totalGrantsChartDataIsNotAvailable && totalFinancialCommitmentsCategoryDataIsNotAvailable)
    
    if (noChartData) {
        data = {
            totalGrantsCategoryData: clinicalTrialCategoriesFallbackData,
            totalFinancialCommitmentsCategoryData: clinicalTrialCategoriesFallbackData,
        };
    }
    
    return (
        <div className="w-full relative">
            <div className={`w-full grid md:grid-cols-2 gap-6 ${noChartData ? 'blur-md' : ''}`}>
                <div>
                    <p className="text-right text-brand-grey-500">
                        Number of grants
                    </p>
                    <ul className="w-full flex flex-col gap-y-2">
                        {Object.entries(data.totalGrantsCategoryData).map(([key, data]) => {
                            const keyWithHighestValue = findKeyWithHighestValue(data)
                        
                            return (
                                <li key={key} className="space-y-1">
                                    <p className="bar-chart-category-label text-gray-600 text-sm">
                                        {key}
                                    </p>
                                    <div className="flex items-center justify-between gap-x-1">
                                        <ResponsiveContainer width="90%" height={20}>
                                            <RechartBarChart
                                                data={[data]}
                                                layout="vertical"
                                                margin={{
                                                    top: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    left: 0,
                                                }}
                                                onMouseEnter={(nextState, event) =>
                                                    onChartMouseEnterOrMove(nextState, event)
                                                }
                                                onMouseMove={(nextState, event) =>
                                                    onChartMouseEnterOrMove(nextState, event)
                                                }
                                                onMouseLeave={onChartMouseLeave}
                                            >
                                                <XAxis
                                                    type="number"
                                                    domain={[0, calculateMaxNumber(chartData.totalGrantsCategoryData)]}
                                                    hide
                                                />
    
                                                <YAxis
                                                    type="category"
                                                    dataKey="Category Label"
                                                    tick={false} 
                                                    hide
                                                />
    
                                                <Bar 
                                                    key={keyWithHighestValue}
                                                    dataKey={keyWithHighestValue}
                                                    stackId="a" 
                                                    fill={categoryColours[keyWithHighestValue as keyof typeof categoryColours]}
                                                    background={{ fill: "#eee" }}
                                                />
    
                                                {calculateRemainingBarsList(
                                                    Object.keys(data), 
                                                    keyWithHighestValue
                                                ).map(bar => (
                                                    <Bar 
                                                        key={bar}
                                                        dataKey={bar}
                                                        stackId="a" 
                                                        fill={categoryColours[bar as keyof typeof categoryColours]}
                                                    />
                                                ))}
                                                
                                            </RechartBarChart>
                                        </ResponsiveContainer>
    
                                        <p className='text-xs text-gray-600'>
                                            {calculateHighestValue(
                                                Object.values(data)
                                            )}
                                        </p>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                
                <div>
                    <div className="flex justify-end gap-x-1">
                        <p className="text-brand-grey-500">
                            Known Financial Commitments (USD)
                        </p>
                        <InfoModal>
                            <p>
                                We used historical currency exchange rates from
                                any currency in which the grant was awarded
                                converted to the US dollar. The term ‘known’ is
                                used as not all grant records have funding
                                amount data.
                            </p>
                        </InfoModal>
                    </div>
    
                    <ul className="w-full flex flex-col gap-y-2">
                        {Object.entries(data.totalFinancialCommitmentsCategoryData).map(([key, data]) => {
                            const keyWithHighestValue = findKeyWithHighestValue(data)
    
                            return (
                                <li key={key} className="space-y-1">
                                    <p className="bar-chart-category-label text-gray-600 text-sm lg:invisible">
                                        {key}
                                    </p>
                                    <div className="flex items-center justify-between gap-x-1">
                                        <ResponsiveContainer width="85%" height={20}>
                                            <RechartBarChart
                                                data={[data]}
                                                layout="vertical"
                                                margin={{
                                                    top: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    left: 0,
                                                }}
                                                onMouseEnter={(nextState, event) =>
                                                    onChartMouseEnterOrMove(nextState, event, true)
                                                }
                                                onMouseMove={(nextState, event) =>
                                                    onChartMouseEnterOrMove(nextState, event, true)
                                                }
                                                onMouseLeave={onChartMouseLeave}
                                            >
                                                <XAxis
                                                    type="number"
                                                    domain={[0, calculateMaxNumber(chartData.totalFinancialCommitmentsCategoryData)]}
                                                    hide
                                                />
    
                                                <YAxis
                                                    type="category"
                                                    dataKey="Category Label"
                                                    tick={false} 
                                                    hide
                                                />
    
                                                <Bar 
                                                    key={keyWithHighestValue}
                                                    dataKey={keyWithHighestValue}
                                                    stackId="a" 
                                                    fill={categoryColours[keyWithHighestValue as keyof typeof categoryColours]}
                                                    background={{ fill: "#eee" }}
                                                />
    
                                                {calculateRemainingBarsList(
                                                    Object.keys(data), 
                                                    keyWithHighestValue
                                                ).map(bar => (
                                                    <Bar 
                                                        key={bar}
                                                        dataKey={bar}
                                                        stackId="a" 
                                                        fill={categoryColours[bar as keyof typeof categoryColours]}
                                                    />
                                                ))}
                                                
                                            </RechartBarChart>
                                        </ResponsiveContainer>
    
                                        <p className='text-xs text-gray-600'>
                                            {dollarValueFormatter(
                                                calculateHighestValue(
                                                    Object.values(data)
                                                )
                                            )}
                                        </p>
    
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
    
            </div>
            
            {noChartData && <NoDataText/>}

        </div>
    )
}

export default ClinicalTrialCategories

interface ToolTipProps {
    nextState: any
    formatToDollar: boolean
    noChartData: boolean
}

function BarListRowTooltipContent({ nextState, formatToDollar, noChartData }: ToolTipProps) {
    const total = Object.values(
        nextState.activePayload[0].payload
    ).reduce((sum: number, value) => {
        return typeof value === 'number' ? sum + value : sum
    }, 0)
    
    const formattedTotal = formatToDollar 
        ? dollarValueFormatter(total)
        : total

    const items = nextState.activePayload.map((payload: any) => ({
        label: payload.dataKey,
        value: formatToDollar 
            ? dollarValueFormatter(payload.value) 
            : payload.value 
            ?? 0,
        colour: payload.color,
    }))

    if (!noChartData) return <TooltipContent title={`Total: ${formattedTotal}`} items={items} />
}