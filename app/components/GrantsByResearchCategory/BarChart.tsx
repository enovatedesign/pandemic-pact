import {Fragment, useContext, MouseEvent} from "react"
import {BarChart as RechartBarChart, Bar, XAxis, YAxis, ResponsiveContainer} from 'recharts';
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {TooltipContext} from '../../helpers/tooltip'
import {researchCategoryColours, researchCategoryDimColours} from "../../helpers/colours"

interface Props {
    chartData: any,
}

export default function BarChart({chartData}: Props) {
    const {tooltipRef} = useContext(TooltipContext)

    const maxTotalNumberOfGrants = Math.max(...chartData.map((data: any) => data["Total Number Of Grants"]))
    const maxAmountCommitted = Math.max(...chartData.map((data: any) => data["Known Financial Commitments"]))

    const onChartMouseEnterOrMove = (nextState: any, event: MouseEvent<SVGPathElement>) => {
        tooltipRef?.current?.open({
            position: {
                x: event.clientX,
                y: event.clientY,
            },
            content: <TooltipContent nextState={nextState} />,
        })
    }

    const onChartMouseLeave = () => {
        tooltipRef?.current?.close()
    }

    return (
        <>
            <div className="w-full grid grid-cols-[minmax(0,_1fr)_auto_minmax(0,_1fr)_auto] gap-y-1">
                <div className="hidden pr-6 col-span-2 justify-self-end md:block">
                    <p className="text-lg text-brand-grey-500">Number of grants</p>
                </div>

                <div className="hidden pl-2 col-span-2 justify-self-end md:block">
                    <p className="text-lg text-brand-grey-500">Known Financial Commitments (USD)</p>
                </div>

                {chartData.map((data: any) => (
                    <Fragment key={"Grants By Research Category " + data["Research Category"] + " Row"}>
                        <div className="self-center mt-1 col-span-4 first:mt-0">
                            <p className="text-gray-600 text-sm">{data["Research Category"]}</p>
                        </div>

                        <div className="col-span-3 md:col-span-1">
                            <ResponsiveContainer width="100%" height={20}>
                                <RechartBarChart
                                    data={[data]}
                                    layout="vertical"
                                    margin={{top: 0, right: 0, bottom: 0, left: 0}}
                                    onMouseEnter={(nextState, event) => onChartMouseEnterOrMove(nextState, event)}
                                    onMouseMove={(nextState, event) => onChartMouseEnterOrMove(nextState, event)}
                                    onMouseLeave={onChartMouseLeave}
                                >
                                    <XAxis
                                        type="number"
                                        hide={true}
                                        domain={[0, maxTotalNumberOfGrants]}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="Research Category"
                                        axisLine={false}
                                        tickLine={false}
                                        hide={true}
                                        onMouseEnter={() => console.log("mouse enter")}
                                    />

                                    <Bar
                                        dataKey="Number Of Grants With Known Financial Commitments"
                                        fill={researchCategoryColours[data["Research Category Value"]]}
                                        stackId="a"
                                        background={{fill: '#eee'}}
                                    />

                                    <Bar
                                        dataKey="Number Of Grants With Unspecified Financial Commitments"
                                        fill={researchCategoryDimColours[data["Research Category Value"]]}
                                        stackId="a"
                                    />
                                </RechartBarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="self-center pl-2 md:pr-6 col-span-1 md:col-span-1 justify-self-end">
                            <p className="text-xs text-gray-600">{data["Total Number Of Grants"]}</p>
                        </div>

                        <div className="col-span-3 md:col-span-1">
                            <ResponsiveContainer width="100%" height={20}>
                                <RechartBarChart
                                    data={[data]}
                                    layout="vertical"
                                    margin={{left: 0, right: 0, top: 0, bottom: 0}}
                                    onMouseEnter={(nextState, event) => onChartMouseEnterOrMove(nextState, event)}
                                    onMouseMove={(nextState, event) => onChartMouseEnterOrMove(nextState, event)}
                                    onMouseLeave={onChartMouseLeave}
                                >
                                    <XAxis
                                        type="number"
                                        hide={true}
                                        domain={[0, maxAmountCommitted]}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="Research Category"
                                        axisLine={false}
                                        tickLine={false}
                                        hide={true}
                                    />

                                    <Bar
                                        dataKey="Known Financial Commitments"
                                        fill={researchCategoryColours[data["Research Category Value"]]}
                                        background={{fill: '#eee'}}
                                    />
                                </RechartBarChart >
                            </ResponsiveContainer >
                        </div >

                        <div className="self-center pl-2 col-span-1 md:col-span-1 justify-self-end">
                            <p className="text-xs text-gray-600">{dollarValueFormatter(data["Known Financial Commitments"])}</p>
                        </div>
                    </Fragment >
                ))}
            </div>
        </>
    )
}

function TooltipContent({nextState}: any) {
    return (
        <div className="flex flex-col gap-y-2">
            {nextState.activePayload.map((payload: any, index: number) => (
                <p
                    key={`grants-by-research-category-tooltip-${index}-${payload.name}`}
                    style={{color: payload.color}}
                >
                    <span>{payload.name}:</span>
                    <span className="ml-2">{
                        payload.dataKey === 'Known Financial Commitments' ?
                            dollarValueFormatter(payload.payload[payload.dataKey]) :
                            payload.payload[payload.dataKey]
                    }</span>
                </p>
            ))}
        </div>
    )
}
