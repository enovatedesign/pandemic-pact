import { Fragment, useContext, useState, MouseEvent, ReactNode } from 'react'
import {
    BarChart as RechartBarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from 'recharts'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import { dollarValueFormatter } from '../helpers/value-formatters'
import { TooltipContext } from '../helpers/tooltip'
import { Colours } from '../helpers/colours'
import InfoModal from './InfoModal'
import TooltipContent from './TooltipContent'

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
    subCharts?: { [key: string]: ReactNode }
}

export function GrantAndFinancialCommitmentBarList({
    data,
    brightColours,
    dimColours,
    subCharts,
}: Props) {
    const { tooltipRef } = useContext(TooltipContext)

    const [selectedSubChart, setSelectedSubChart] = useState<string | null>(
        null
    )

    if (subCharts && selectedSubChart) {
        const selectedParent = data.find(
            datum => datum['Category Value'] === selectedSubChart
        )

        const selectedParentLabel = selectedParent
            ? `of "${selectedParent['Category Label']}"`
            : ''

        return (
            <>
                <div className="flex justify-center items-center w-full">
                    <button
                        onClick={() => setSelectedSubChart(null)}
                        className="flex items-center"
                    >
                        <span className="cursor-pointer mr-4 bg-brand-grey-200 p-1.5 rounded-md shadow-lg">
                            <ArrowLeftIcon className="size-6 text-brand-grey-500" />
                        </span>
                    </button>

                    <p className="text-brand-grey-500">
                        Viewing Sub-Categories {selectedParentLabel}
                    </p>
                </div>

                {subCharts[selectedSubChart]}
            </>
        )
    }

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
                content: (
                    <GrantAndFinancialCommitmentBarListTooltipContent
                        nextState={nextState}
                    />
                ),
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
            <div className="w-full grid grid-cols-[minmax(0,_1fr)_auto_minmax(0,_1fr)_auto] gap-y-1">
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

                {data.map((datum: any) => (
                    <Fragment key={datum['Category Value']}>
                        <div className="self-center mt-1 col-span-4 first:mt-0">
                            <div className="flex flex-col gap-x-2 gap-y-1 justify-between md:flex-row">
                                <p className="text-gray-600 text-sm">
                                    {datum['Category Label']}
                                </p>
                                {subCharts && (
                                    <button
                                        className="self-start text-center font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled px-3 text-sm bg-primary-lightest text-secondary hover:bg-primary-lighter"
                                        onClick={() =>
                                            setSelectedSubChart(
                                                datum['Category Value']
                                            )
                                        }
                                    >
                                        View sub-categories
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="col-span-3 md:col-span-1">
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

                        <div className="self-center pl-2 md:pr-6 col-span-1 md:col-span-1 justify-self-end">
                            <p className="text-xs text-gray-600">
                                {datum['Total Grants']}
                            </p>
                        </div>

                        <div className="col-span-3 md:col-span-1">
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

                        <div className="self-center pl-2 col-span-1 md:col-span-1 justify-self-end">
                            <p className="text-xs text-gray-600">
                                {dollarValueFormatter(
                                    datum['Known Financial Commitments (USD)']
                                )}
                            </p>
                        </div>
                    </Fragment>
                ))}
            </div>
        </>
    )
}

function GrantAndFinancialCommitmentBarListTooltipContent({ nextState }: any) {
    const items = nextState.activePayload.map((payload: any) => ({
        label: payload.name,
        value:
            payload.dataKey === 'Known Financial Commitments (USD)'
                ? dollarValueFormatter(payload.value)
                : payload.value,
        colour: payload.color,
    }))

    return <TooltipContent items={items} />
}
