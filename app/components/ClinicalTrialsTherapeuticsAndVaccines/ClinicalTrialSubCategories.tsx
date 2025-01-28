import { useContext } from "react"
import { ResponsiveContainer, XAxis, YAxis, Bar, BarChart } from "recharts"

import { getColoursByField, isChartDataUnavailable } from "@/app/helpers/bar-list"
import { dollarValueFormatter } from "@/app/helpers/value-formatters"
import { TooltipContext } from "@/app/helpers/tooltip"
import { clinicalTrialSubCategoriesFallbackData } from "../NoData/visualisationFallbackData"

import BarListRowHeading from "../BarList/BarListRowHeading"
import InfoModal from "../InfoModal"
import TooltipContent from "../TooltipContent"
import NoDataText from "../NoData/NoDataText"

export interface ClinicalTrialSubCategoriesProps {
    subCategories: {
        label: string, 
        data: any[]
    }[]
}

const ClinicalTrialSubCategories = ({ subCategories }: ClinicalTrialSubCategoriesProps) => {
    const { brightColours, dimColours } = getColoursByField('ClinicalTrialPhase')

    const { tooltipRef } = useContext(TooltipContext)

    let chartData = subCategories

    const onChartMouseEnterOrMove = (
        nextState: any,
        event: any,
        formatToDollar: boolean = false
    ) => {
        if (nextState?.activePayload) {
            tooltipRef?.current?.open({
                position: {
                    x: event.clientX,
                    y: event.clientY,
                },
                content: <BarListRowTooltipContent nextState={nextState} formatToDollar={formatToDollar} />,
            })
        } else {
            onChartMouseLeave()
        }
    }
    
    const onChartMouseLeave = () => {
        tooltipRef?.current?.close()
    }

    const chartDataIsNotAvailable = isChartDataUnavailable(subCategories.flatMap(subCategory => subCategory.data))
    
    if (chartDataIsNotAvailable) chartData = clinicalTrialSubCategoriesFallbackData
    
    return (

        <div className="w-full relative">
            <div className={`w-full grid md:grid-cols-2 gap-6 ${chartDataIsNotAvailable ? 'blur-md' : ''}`}>
                <div>
                    <p className="text-right text-brand-grey-500">
                        Number of grants
                    </p>

                    {chartData.map(({ label, data }) => {
                        const maxNumberOfGrants = Math.max(...data.map(datum => datum['Total Grants']))
                        
                        return (
                            <div key={label}>
                                <h3 className="text-lg mb-2 mt-6 lg:whitespace-nowrap">
                                    {label}
                                </h3>
                                
                                {data.map(datum => (
                                    <div key={datum['Category Value']}>
                                        <BarListRowHeading>
                                            <p className="bar-chart-category-label text-gray-600 text-sm">
                                                {datum['Category Label']}
                                            </p>
                                        </BarListRowHeading>

                                        <div className="flex items-center justify-between gap-x-1">
                                            <ResponsiveContainer width="90%" height={20}>
                                                <BarChart
                                                    data={[datum]}
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
                                                        hide={true}
                                                        domain={[0, maxNumberOfGrants]}
                                                    />
                            
                                                    <YAxis
                                                        type="category"
                                                        dataKey={'Category Label'}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        hide={true}
                                                    />
                            
                                                    <Bar
                                                        dataKey="Grants With Known Financial Commitments"
                                                        fill={brightColours[datum['Category Label']]}
                                                        stackId="a"
                                                        background={{ fill: '#eee' }}
                                                    />
                                                    
                                                    <Bar
                                                        dataKey="Grants With Unspecified Financial Commitments"
                                                        fill={dimColours[datum['Category Label']]}
                                                        stackId="a"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>

                                            <p className='text-xs text-gray-600'>
                                                {datum['Total Grants']}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    })}
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
                                converted to the US dollars. The term ‘known’ is
                                used as not all grant records have funding
                                amount data.
                            </p>
                        </InfoModal>
                    </div>
                    
                    {chartData.map(({ label, data }) => {
                        const maxNumberOfGrants = Math.max(...data.map(datum => datum['Known Financial Commitments (USD)']))
                        
                        return (
                            <div key={label}>
                                <h3 className="text-lg mb-2 mt-6 col-span-4 lg:whitespace-nowrap lg:invisible">
                                    {label}
                                </h3>
                                
                                {data.map(datum => (
                                    <div key={datum['Category Value']}>
                                        <BarListRowHeading>
                                            <p className="bar-chart-category-label text-gray-600 text-sm lg:whitespace-nowrap lg:invisible">
                                                {datum['Category Label']}
                                            </p>
                                        </BarListRowHeading>

                                        <div className="flex items-center justify-between gap-x-1">
                                            <ResponsiveContainer width="85%" height={20}>
                                                <BarChart
                                                    data={[datum]}
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
                                                        hide={true}
                                                        domain={[0, maxNumberOfGrants]}
                                                    />
                            
                                                    <YAxis
                                                        type="category"
                                                        dataKey={'Category Label'}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        hide={true}
                                                    />
                            
                                                    <Bar
                                                        dataKey="Known Financial Commitments (USD)"
                                                        fill={brightColours[datum['Category Label']]}
                                                        stackId="a"
                                                        background={{ fill: '#eee' }}
                                                    />
                                                    
                                                </BarChart>
                                            </ResponsiveContainer>

                                            <p className='text-xs text-gray-600'>
                                                {dollarValueFormatter(datum['Known Financial Commitments (USD)'])}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                
                            </div>
                        )
                    })}
                </div>
            </div>

            {chartDataIsNotAvailable && <NoDataText/>}
            
        </div>
    )
}

export default ClinicalTrialSubCategories

interface ToolTipProps {
    nextState: any
    formatToDollar: boolean
}

function BarListRowTooltipContent({ nextState, formatToDollar }: ToolTipProps) {
    const items = nextState.activePayload.map((payload: any) => ({
        label: payload.dataKey,
        value: formatToDollar 
            ? dollarValueFormatter(payload.value) 
            : payload.value 
            ?? 0,
        colour: payload.color,
    }))

    return <TooltipContent items={items} />
}
