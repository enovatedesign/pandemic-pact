import {useContext} from "react"
import {BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import Legend from "../Legend"
import {sumNumericGrantAmounts} from "../../helpers/reducers"
import {dollarValueFormatter, axisDollarFormatter} from "../../helpers/value-formatters"
import {GlobalFilterContext} from "../../helpers/filter"
import selectOptions from "../../../data/dist/select-options.json"
import {grantsAndAmountsBarChartColours} from "../../helpers/colours"
import {baseTooltipProps} from "../../helpers/tooltip"

export default function BarChart() {
    const {
        grantsWithKnownAmountsColour,
        grantsWithUnspecifiedAmountsColour,
        amountCommittedColour
    } = grantsAndAmountsBarChartColours

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
            <div className="flex flex-col gap-y-2 w-full">
                <Legend
                    categories={['Grants With Known Financial Commitments', 'Grants With Unspecified Financial Commitments', 'Known Financial Commitments']}
                    colours={[grantsWithKnownAmountsColour, grantsWithUnspecifiedAmountsColour, amountCommittedColour]}
                />
            </div>

            <div className="flex w-full relative">
                <div className="w-8">
                    <p className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap -rotate-90 text-brand-grey-500 text-lg">Grants</p>
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
                                className="text-lg"
                            />

                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={axisDollarFormatter}
                                className="text-lg"
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
                                {...baseTooltipProps}
                            />

                            <Bar
                                yAxisId="left"
                                dataKey="Grants With Known Financial Commitments"
                                fill={grantsWithKnownAmountsColour}
                                stackId="a"
                            />

                            <Bar
                                yAxisId="left"
                                dataKey="Grants With Unspecified Financial Commitments"
                                fill={grantsWithUnspecifiedAmountsColour}
                                stackId="a"
                            />

                            <Bar
                                yAxisId="right"
                                dataKey="Known Financial Commitments (USD)"
                                fill={amountCommittedColour}
                                stackId="b"
                            />
                        </RechartBarChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-8">
                    <p className="absolute top-1/2 whitespace-nowrap rotate-90 -translate-x-1/2  text-brand-grey-500 text-lg">Known Financial Commitments (USD)</p>
                </div>
            </div>
        </>
    )
}
