import {ScatterChart as RechartScatterChart, Scatter, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell} from 'recharts';
import {dollarValueFormatter, axisDollarFormatter} from "../../helpers/value-formatters"
import {researchCategoryColours} from "../../helpers/colours"

interface Props {
    chartData: any,
}

const CustomDot = (props: any) => {
    const {cx, cy, fill} = props;
    return (
        <circle
            cx={cx}
            cy={cy}
            r={6}
            fill={fill}
        />
    );
};

export default function ScatterChart({chartData}: Props) {
    return (
        <ResponsiveContainer width="100%" height={800}>
            <RechartScatterChart
                margin={{
                    top: 30,
                    right: 30,
                    bottom: 30,
                    left: 30,
                }}
            >
                <CartesianGrid />

                <XAxis
                    type="number"
                    dataKey="Total Number Of Grants"
                    allowDecimals={false}
                    label={{
                        value: "Grants",
                        position: "bottom",
                    }}
                    className='text-lg'
                />

                <YAxis
                    type="number"
                    dataKey="Known Financial Commitments"
                    tickFormatter={axisDollarFormatter}
                    label={{
                        value: "Known Financial Commitments (USD)",
                        position: "left",
                        angle: -90,
                        style: {textAnchor: 'middle'},
                        offset: 20,
                    }}
                    className='text-lg'
                />

                <Tooltip
                    isAnimationActive={false}
                    cursor={{strokeDasharray: '3 3'}}
                    formatter={(value: any, name: any, props: any) => {
                        if (name.includes("Known Financial Commitments")) {
                            return [
                                dollarValueFormatter(value),
                                "Known Financial Commitments",
                                props,
                            ]
                        }

                        return [value, name, props]
                    }}
                />

                <Scatter
                    data={chartData}
                    shape={<CustomDot />}
                >
                    {chartData.map((datum: any, index: number) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={researchCategoryColours[datum["Research Category Value"]]}
                        />
                    ))}
                </Scatter>
            </RechartScatterChart >
        </ResponsiveContainer >
    )
}
