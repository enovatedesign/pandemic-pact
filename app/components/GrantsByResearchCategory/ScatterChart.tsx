import {ScatterChart as TremorScatterChart, Color} from "@tremor/react"
import {dollarValueFormatter} from "../../helpers/value-formatters"

interface Props {
    chartData: any,
}

export default function ScatterChart({chartData}: Props) {
    const colours: Color[] = [
        'red',
        'lime',
        'cyan',
        'violet',
        'orange',
        'emerald',
        'indigo',
        'purple',
        'amber',
        'green',
        'blue',
        'fuchsia',
        'yellow',
        'neutral',
    ]

    return (
        <TremorScatterChart
            className="h-80 -ml-2"
            data={chartData}
            category="Research Category"
            x="Total Number Of Grants"
            y="Amount Committed"
            showOpacity={true}
            minYValue={60}
            valueFormatter={{
                x: (value: number) => `${value} grants`,
                y: dollarValueFormatter,
            }}
            showLegend={false}
            autoMinXValue
            autoMinYValue
            colors={colours}
        />
    )
}
