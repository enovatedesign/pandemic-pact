import {Fragment} from "react"
import {Subtitle} from "@tremor/react"
import {BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import {dollarValueFormatter} from "../../helpers/value-formatters"

interface Props {
    chartData: any,
}

export default function BarChart({chartData}: Props) {
    const maxTotalNumberOfGrants = Math.max(...chartData.map((data: any) => data["Total Number Of Grants"]))
    const maxAmountCommitted = Math.max(...chartData.map((data: any) => data["Amount Committed"]))

    return (
        <div className="w-full grid grid-cols-[minmax(0,_1.25fr)_minmax(0,_1fr)_auto_minmax(0,_1fr)_auto] gap-y-1">
            {chartData.map((data: any, index: number) => (
                <Fragment key={"Grants By Research Category " + data["Research Category"] + " Row"}>
                    <div className="self-center py-3 col-span-1">
                        <p className="text-sm text-gray-600 truncate">{data["Research Category"]}</p>
                    </div>

                    <div className="col-span-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartBarChart
                                data={[data]}
                                layout="vertical"
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
                                />

                                <Tooltip
                                    wrapperStyle={{zIndex: 99}}
                                    cursor={{fill: 'transparent'}}
                                    labelStyle={{display: 'none'}}
                                    isAnimationActive={false}
                                />

                                <Bar
                                    dataKey="Number Of Grants With Known Amount Committed"
                                    fill="#3b82f6"
                                    stackId="a"
                                    background={{fill: '#eee'}}
                                />

                                <Bar
                                    dataKey="Number Of Grants With Unspecified Amount Committed"
                                    fill="#f59e0b"
                                    stackId="a"
                                />
                            </RechartBarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="self-center py-3 pl-2 pr-8 col-span-1 justify-self-end">
                        <p className="text-sm text-gray-600">{data["Total Number Of Grants"]}</p>
                    </div>

                    <div className="col-span-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartBarChart
                                data={[data]}
                                layout="vertical"
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

                                <Tooltip
                                    wrapperStyle={{zIndex: 99}}
                                    formatter={dollarValueFormatter}
                                    labelStyle={{display: 'none'}}
                                    cursor={{fill: 'transparent'}}
                                    isAnimationActive={false}
                                />

                                <Bar
                                    dataKey="Amount Committed"
                                    fill="#22c55e"
                                    background={{fill: '#eee'}}
                                />
                            </RechartBarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="self-center py-3 pl-2 col-span-1 justify-self-end">
                        <p className="text-sm text-gray-600">{dollarValueFormatter(data["Amount Committed"])}</p>
                    </div>
                </Fragment>
            ))}

            <div className="col-span-1" />

            <div className="pr-8 col-span-2 justify-self-end">
                <Subtitle>Number of projects</Subtitle>
            </div>

            <div className="pl-2 col-span-2 justify-self-end">
                <Subtitle>Known amount committed (USD)</Subtitle>
            </div>
        </div>
    )
}
