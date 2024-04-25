import { dollarValueFormatter } from '../helpers/value-formatters'
import TooltipContent from './TooltipContent'

interface Props {
    props: any
    chartData: any
}

export default function RechartTrendsTooltipContent({
    props,
    chartData,
}: Props) {
    if (!props.active) return null

    // Sort tooltip items by descending dollar value, so highest is at the top
    props.payload.sort(
        (a: { value: number }, b: { value: number }) => b.value - a.value
    )

    const years = chartData.map((item: any) => item.year).sort()

    const items = props.payload.map((item: any) => {
        let trend = undefined
        let trendValueAmount = undefined

        const year = item.payload.year

        const yearIndex = years.indexOf(year)

        if (yearIndex > 0) {
            const previousYear = years[yearIndex - 1]
            
            const previousYearObject = chartData.find(
                (item: any) => item.year === previousYear
            )

            const previousYearValue = previousYearObject
                ? previousYearObject[item.dataKey]
                : 0
            if (item.value > previousYearValue) {
                trend = 'up'
                trendValueAmount = dollarValueFormatter(item.value - previousYearValue)
            } else if (item.value < previousYearValue) {
                trend = 'down'
                trendValueAmount = dollarValueFormatter(previousYearValue - item.value)
            } else {
                trend = 'none'
                trendValueAmount = null
            }
        }
        return {
            label: item.name,
            value: dollarValueFormatter(item.value),
            colour: item.color,
            trend,
            trendValueAmount
        }
    })

    return <TooltipContent title={props.label} items={items} />
}
