import {useContext} from "react"
import {Legend} from "@tremor/react"
import {BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {dollarValueFormatter} from "../../helpers/value-formatters"
import {GlobalFilterContext} from "../../helpers/filter"
import selectOptions from "../../../data/dist/select-options.json"

export default function BarChart() {
    const {grants} = useContext(GlobalFilterContext)

    const chartData = selectOptions.Disease.map(function (disease) {
        const grantsWithKnownAmounts = grants
            .filter((grant: any) => grant.Disease.includes(disease.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted === "number")

        const grantsWithUnspecifiedAmounts = grants
            .filter((grant: any) => grant.Disease.includes(disease.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted !== "number")

        const moneyCommitted = grantsWithKnownAmounts.reduce(...sumNumericGrantAmounts)

        return {
            "Disease": disease.label,
            "Grants With Known Financial Commitments": grantsWithKnownAmounts.length,
            "Grants With Unspecified Financial Commitments": grantsWithUnspecifiedAmounts.length,
            "Total Grants": grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
            "Known Financial Commitments (USD)": moneyCommitted,
        }
    }).filter(disease => disease["Total Grants"] > 0)

    return (
        <>
            <div className="flex flex-col gap-y-2">
                <Legend
                    categories={['Grants With Known Financial Commitments', 'Grants With Unspecified Financial Commitments', 'Known Financial Commitments']}
                    colors={['blue', 'orange', 'green']}
                />
            </div>

            <div className="flex w-full relative">
                <div className="w-8">
                    <p className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap -rotate-90 text-black">Grants</p>
                </div>

                <div className="w-full h-[700px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartBarChart
                            width={500}
                            height={300}
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <XAxis dataKey="Disease" />

                            <YAxis
                                yAxisId="left"
                                orientation="left"
                            />

                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={dollarValueFormatter}
                            />

                            <Tooltip
                                formatter={(value: any, name: any, props: any) => {
                                    if (name.includes("Amount Committed (USD)")) {
                                        return [
                                            dollarValueFormatter(value),
                                            "Known Financial Commitments (USD)",
                                            props,
                                        ]
                                    }

                                    return [value, name, props]
                                }}
                            />

                            <Bar
                                yAxisId="left"
                                dataKey="Grants With Known Financial Commitments"
                                fill="#3b82f6"
                                stackId="a"
                            />

                            <Bar
                                yAxisId="left"
                                dataKey="Grants With Unspecified Financial Commitments"
                                fill="#f59e0b"
                                stackId="a"
                            />

                            <Bar
                                yAxisId="right"
                                dataKey="Known Financial Commitments (USD)"
                                fill="#22c55e"
                                stackId="b"
                            />
                        </RechartBarChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-8">
                    <p className="absolute top-1/2 whitespace-nowrap rotate-90 -translate-x-1/2 text-black">Known Financial Commitments (USD)</p>
                </div>
            </div>
        </>
    )
}
