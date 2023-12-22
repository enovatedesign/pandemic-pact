import {Fragment} from "react"
import {BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {researchCategoryColours, researchCategoryDimColours} from "../../helpers/colours"

interface Props {
    chartData: any,
}

export default function BarChart({chartData}: Props) {
    const maxTotalNumberOfGrants = Math.max(...chartData.map((data: any) => data["Total Number Of Grants"]))
    const maxAmountCommitted = Math.max(...chartData.map((data: any) => data["Known Financial Commitments"]))

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
                                        contentStyle={{fontSize: '.9rem'}}
                                        formatter={(value: any, name: any, props: any) => {
                                            return [value, name.replace("Number Of ", ""), props]
                                        }}
                                        isAnimationActive={false}
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
                                        contentStyle={{fontSize: '.9rem'}}
                                        cursor={{fill: 'transparent'}}
                                        isAnimationActive={false}
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
