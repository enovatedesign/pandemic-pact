import {Flex, Subtitle} from "@tremor/react"
import {BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import VisualisationCard from "./VisualisationCard"
import {type CardProps} from "../types/card-props"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import {dollarValueFormatter} from "../helpers/value-formatters"
import selectOptions from "../../data/dist/select-options.json"

export default function GrantsByDisease({globallyFilteredDataset}: CardProps) {
    const chartData = selectOptions.Disease.map(function (disease) {
        const grantsWithKnownAmounts = globallyFilteredDataset
            .filter((grant: any) => grant.Disease.includes(disease.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted === "number")

        const grantsWithUnspecifiedAmounts = globallyFilteredDataset
            .filter((grant: any) => grant.Disease.includes(disease.value))
            .filter((grant: any) => typeof grant.GrantAmountConverted !== "number")

        const moneyCommitted = grantsWithKnownAmounts.reduce(...sumNumericGrantAmounts)

        return {
            "Disease": disease.label,
            "Grants With Known Amount Committed": grantsWithKnownAmounts.length,
            "Grants With Unspecified Amount Committed": grantsWithUnspecifiedAmounts.length,
            "Total Grants": grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
            "Amount Committed (USD)": moneyCommitted,
        }
    }).filter(disease => disease["Total Grants"] > 0)

    return (
        <VisualisationCard
            filteredDataset={globallyFilteredDataset}
            id="grants-by-disease"
            title="Grants By Disease"
        >
            <Flex
                flexDirection="row"
            >
                <div className="w-8">
                    <Subtitle className="absolute whitespace-nowrap -rotate-90 text-black">Grants</Subtitle>
                </div>

                <div className="w-full h-[800px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
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
                            <Legend
                                verticalAlign="top"
                            />

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
                                        return [dollarValueFormatter(value), name, props]
                                    }

                                    return [value, name, props]
                                }}
                            />

                            <Bar
                                yAxisId="left"
                                dataKey="Grants With Known Amount Committed"
                                fill="#3b82f6"
                                stackId="a"
                            />

                            <Bar
                                yAxisId="left"
                                dataKey="Grants With Unspecified Amount Committed"
                                fill="#f59e0b"
                                stackId="a"
                            />

                            <Bar
                                yAxisId="right"
                                dataKey="Amount Committed (USD)"
                                fill="#22c55e"
                                stackId="b"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-8">
                    <Subtitle className="absolute whitespace-nowrap rotate-90 -translate-x-1/2 text-black">Amount Committed (USD)</Subtitle>
                </div>
            </Flex>
        </VisualisationCard>
    )
}
