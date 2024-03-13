import TooltipContent from './TooltipContent'
import { dollarValueFormatter } from '../helpers/value-formatters'

export default function RechartTooltipContent({
    active,
    payload,
    label,
}: {
    active?: boolean
    payload: any
    label: string
}) {
    if (!active) return null

    // Sort tooltip items by descending dollar value, so highest is at the top
    payload.sort(
        (a: { value: number }, b: { value: number }) => b.value - a.value
    )

    const items = payload.map((item: any) => ({
        label: item.name,
        value: dollarValueFormatter(item.value),
        colour: item.color,
    }))

    return <TooltipContent title={label} items={items} />
}

export function rechartTooltipContentFunction(props: any) {
    return (
        <RechartTooltipContent
            active={props.active}
            payload={props.payload}
            label={props.label}
        />
    )
}
