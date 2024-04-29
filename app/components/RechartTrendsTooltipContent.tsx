import { dollarValueFormatter } from '../helpers/value-formatters'
import TooltipContent from './TooltipContent'

interface Props {
    props: any
    chartData: any
    numOfGrantsBoolean?: boolean
}

export default function RechartTrendsTooltipContent({
    props,
    chartData,
    numOfGrantsBoolean,
}: Props) {
    if (!props.active) return null

    // Sort tooltip items by descending dollar value, so highest is at the top
    props.payload.sort(
        (a: { value: number }, b: { value: number }) => b.value - a.value
    )

    const years = chartData.map((item: any) => item.year).sort()

    const items = props.payload.map((item: any) => {
        let trend = undefined
        let trendPercentageDifference = undefined

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
                trendPercentageDifference = Math.round(((item.value - previousYearValue) / previousYearValue) * 100);
            } else if (item.value < previousYearValue) {
                trend = 'down'
                trendPercentageDifference = Math.round(((previousYearValue - item.value) / item.value) * 100);
            } else {
                trend = 'none'
                trendPercentageDifference = null
            }
        }
        return {
            label: item.name,
            value: !numOfGrantsBoolean && dollarValueFormatter(item.value),
            colour: item.color,
            trend,
            trendPercentageDifference
        }
    })

    return <TooltipContent title={props.label} items={items} />
}
