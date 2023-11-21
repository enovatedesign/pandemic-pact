import {Fragment} from "react"
import {Flex, Subtitle} from "@tremor/react"
import {ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Scatter, ResponsiveContainer} from 'recharts'
import {dollarValueFormatter} from "../../helpers/value-formatters"

interface Props {
    globallyFilteredDataset: any,
}

export default function TemporalChart({globallyFilteredDataset}: Props) {
    const data = [
        {
            year: '2020',
            "COVID": {
                "Total Grants": 2400,
                "Amount Committed (USD)": 100000,
            },
            "Zika Virus": {
                "Total Grants": 1000,
                "Amount Committed (USD)": 50000,
            },
        },
        {
            year: '2021',
            "COVID": {
                "Total Grants": 3500,
                "Amount Committed (USD)": 150000,
            },
            "Zika Virus": {
                "Total Grants": 500,
                "Amount Committed (USD)": 5000,
            },
        },
        {
            year: '2022',
            "COVID": {
                "Total Grants": 7000,
                "Amount Committed (USD)": 200000,
            },
            "Zika Virus": {
                "Total Grants": 100,
                "Amount Committed (USD)": 1000,
            },
        },
    ]

    const diseases = [
        {name: "COVID", colour: "red"},
        {name: "Zika Virus", colour: "blue"},
    ]

    return (
        <Flex
            flexDirection="row"
        >
            <div className="w-8">
                <Subtitle className="absolute whitespace-nowrap -rotate-90 text-black flex items-center gap-x-2">
                    <span>&#9679;</span> Grants
                </Subtitle>
            </div>

            <div className="w-full h-[700px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        width={500}
                        height={400}
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid stroke="#f5f5f5" />

                        <Tooltip
                            formatter={(value: any, name: any, props: any) => {
                                let newValue = value

                                if (name.includes("Amount Committed (USD)")) {
                                    newValue = dollarValueFormatter(value)
                                }

                                return [
                                    newValue,
                                    name.split(".").join(" "),
                                    props,
                                ]
                            }}
                        />

                        <Legend
                            formatter={value => value.split(".")[0]}
                        />

                        <XAxis dataKey="year" type="category" />

                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            type="number"
                        />

                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={dollarValueFormatter}
                        />

                        {diseases.map(({name, colour}) =>
                            <Fragment key={name}>
                                <Scatter
                                    dataKey={`${name}.Total Grants`}
                                    fill={colour}
                                    yAxisId="left"
                                />

                                <Line
                                    dataKey={`${name}.Amount Committed (USD)`}
                                    stroke={colour}
                                    dot={false}
                                    activeDot={false}
                                    legendType="none"
                                    yAxisId="right"
                                    strokeDasharray="5 5"
                                />
                            </Fragment>
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="w-8">
                <Subtitle className="absolute whitespace-nowrap rotate-90 -translate-x-1/2 text-black flex items-center gap-x-2">
                    <span className="text-4xl block">&#9476;</span> Amount Committed (USD)
                </Subtitle>
            </div>
        </Flex>
    )
}
