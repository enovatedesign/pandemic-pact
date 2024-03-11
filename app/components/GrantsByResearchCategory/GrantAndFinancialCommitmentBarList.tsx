import { Fragment, useContext, useState, MouseEvent } from 'react'
import {
    BarChart as RechartBarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from 'recharts'
import { dollarValueFormatter } from '../../helpers/value-formatters'
import { TooltipContext } from '../../helpers/tooltip'
import { Colours } from '../../helpers/colours'
import InfoModal from '../InfoModal'

export type GrantAndFinancialCommitmentBarListData = Array<{
    'Known Financial Commitments (USD)': number
    'Grants With Known Financial Commitments': number
    'Grants With Unspecified Financial Commitments': number
    'Total Grants': number
    'Category Label': string
    'Category Value': string
}>

interface Props {
    data: GrantAndFinancialCommitmentBarListData
    brightColours: Colours
    dimColours: Colours
}

export function GrantAndFinancialCommitmentBarList({
    data,
    brightColours,
    dimColours,
}: Props) {
    const { tooltipRef } = useContext(TooltipContext)

    const [selectedCategory, setSelectedCategory] = useState<string | null>()

    const maxTotalNumberOfGrants = Math.max(
        ...data.map((data: any) => data['Total Grants'])
    )
    const maxAmountCommitted = Math.max(
        ...data.map((data: any) => data['Known Financial Commitments (USD)'])
    )

    const onChartMouseEnterOrMove = (
        nextState: any,
        event: MouseEvent<SVGPathElement>
    ) => {
        if (nextState?.activePayload) {
            tooltipRef?.current?.open({
                position: {
                    x: event.clientX,
                    y: event.clientY,
                },
                content: <TooltipContent nextState={nextState} />,
            })
        } else {
            onChartMouseLeave()
        }
    }

    const onChartMouseLeave = () => {
        tooltipRef?.current?.close()
    }

    return (
        <>
            <div className="w-full grid grid-cols-[minmax(0,_1fr)_auto_minmax(0,_1fr)_auto_auto] gap-y-1">
                <div className="hidden pr-6 col-span-2 justify-self-end md:block">
                    <p className="text-lg text-brand-grey-500">
                        Number of grants
                    </p>
                </div>

                <div className="hidden pl-2 col-span-2 justify-self-end md:block">
                    <div className="flex gap-x-1">
                        <p className="text-lg text-brand-grey-500">
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
                </div>

                <div className="col-span-1"></div>

                {data.map((datum: any) => (
                    <Fragment key={datum['Category Value']}>
                        <div className="self-center mt-1 col-span-5 first:mt-0">
                            <p className="text-gray-600 text-sm">
                                {datum['Category Label']}
                            </p>
                        </div>

                        <div className="col-span-4 md:col-span-1">
                            <ResponsiveContainer width="100%" height={20}>
                                <RechartBarChart
                                    data={[datum]}
                                    layout="vertical"
                                    margin={{
                                        top: 0,
                                        right: 0,
                                        bottom: 0,
                                        left: 0,
                                    }}
                                    onMouseEnter={(nextState, event) =>
                                        onChartMouseEnterOrMove(
                                            nextState,
                                            event
                                        )
                                    }
                                    onMouseMove={(nextState, event) =>
                                        onChartMouseEnterOrMove(
                                            nextState,
                                            event
                                        )
                                    }
                                    onMouseLeave={onChartMouseLeave}
                                >
                                    <XAxis
                                        type="number"
                                        hide={true}
                                        domain={[0, maxTotalNumberOfGrants]}
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
                                        fill={
                                            brightColours[
                                                datum['Category Value']
                                            ]
                                        }
                                        stackId="a"
                                        background={{ fill: '#eee' }}
                                    />

                                    <Bar
                                        dataKey="Grants With Unspecified Financial Commitments"
                                        fill={
                                            dimColours[datum['Category Value']]
                                        }
                                        stackId="a"
                                    />
                                </RechartBarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="self-center pl-2 md:pr-6 col-span-1 justify-self-end">
                            <p className="text-xs text-gray-600">
                                {datum['Total Grants']}
                            </p>
                        </div>

                        <div className="col-span-4 md:col-span-1">
                            <ResponsiveContainer width="100%" height={20}>
                                <RechartBarChart
                                    data={[datum]}
                                    layout="vertical"
                                    margin={{
                                        left: 0,
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                    }}
                                    onMouseEnter={(nextState, event) =>
                                        onChartMouseEnterOrMove(
                                            nextState,
                                            event
                                        )
                                    }
                                    onMouseMove={(nextState, event) =>
                                        onChartMouseEnterOrMove(
                                            nextState,
                                            event
                                        )
                                    }
                                    onMouseLeave={onChartMouseLeave}
                                >
                                    <XAxis
                                        type="number"
                                        hide={true}
                                        domain={[0, maxAmountCommitted]}
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
                                        fill={
                                            brightColours[
                                                datum['Category Value']
                                            ]
                                        }
                                        background={{ fill: '#eee' }}
                                    />
                                </RechartBarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="self-center pl-2 col-span-1 justify-self-end">
                            <p className="text-xs text-gray-600">
                                {dollarValueFormatter(
                                    datum['Known Financial Commitments (USD)']
                                )}
                            </p>
                        </div>

                        <div className="self-center pl-2 col-span-1 justify-self-end">
                            <button
                                onClick={() =>
                                    setSelectedCategory(datum['Category Value'])
                                }
                            >
                                Show Subcategories
                            </button>
                        </div>
                    </Fragment>
                ))}
            </div>
        </>
    )
}

function TooltipContent({ nextState }: any) {
    return (
        <div className="flex flex-col gap-y-2">
            {nextState.activePayload.map((payload: any, index: number) => (
                <p
                    key={`${index}-${payload.name}`}
                    style={{ color: payload.color }}
                >
                    <span>{payload.name}:</span>

                    <span className="ml-2">
                        {payload.dataKey === 'Known Financial Commitments (USD)'
                            ? dollarValueFormatter(
                                  payload.payload[payload.dataKey]
                              )
                            : payload.payload[payload.dataKey]}
                    </span>
                </p>
            ))}
        </div>
    )
}
