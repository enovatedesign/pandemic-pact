import {Flex, Subtitle} from "@tremor/react"
import {BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import VisualisationCard from "./VisualisationCard"
import {type CardProps} from "../types/card-props"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import {dollarValueFormatter} from "../helpers/value-formatters"
import selectOptions from "../../data/dist/select-options.json"

export default function GrantsByDisease({globallyFilteredDataset}: CardProps) {
    const chartData = selectOptions.Disease.map(function (disease) {
        const grants = globallyFilteredDataset.filter((grant: any) => grant.Disease.includes(disease.value))

        const moneyCommitted = grants.reduce(...sumNumericGrantAmounts)

        return {
            "Disease": disease.label,
            "Grants": grants.length,
            "Amount Committed (USD)": moneyCommitted,
        }
    }).filter(disease => disease["Grants"] > 0)

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
                    <Subtitle className="absolute whitespace-nowrap -rotate-90">Grants</Subtitle>
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
                                stroke="#22c55e"
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
                                dataKey="Grants"
                                fill="#3b82f6"
                            />

                            <Bar
                                yAxisId="right"
                                dataKey="Amount Committed (USD)"
                                fill="#22c55e"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-8">
                    <Subtitle className="absolute whitespace-nowrap rotate-90 -translate-x-1/2">Amount Committed (USD)</Subtitle>
                </div>
            </Flex>
        </VisualisationCard>
    )
}
