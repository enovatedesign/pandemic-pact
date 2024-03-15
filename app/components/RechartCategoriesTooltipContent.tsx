import { useContext } from 'react'
import { GlobalFilterContext } from '../helpers/filters'
import { dollarValueFormatter } from '../helpers/value-formatters'
import TooltipContent from './TooltipContent'
import selectOptions from '../../data/dist/select-options.json'

interface Props {
    active?: boolean
    payload: any
    label: string
    category?: string
}

export default function RechartCategoriesTooltipContent({
    active,
    payload,
    label,
    category,
}: Props) {
    const { filters } = useContext(GlobalFilterContext)

    if (!active) return null

    // Sort tooltip items by descending dollar value, so highest is at the top
    payload.sort(
        (a: { value: number }, b: { value: number }) => b.value - a.value
    )

    const items = payload.map((item: any) => {
        let bold = false

        if (category) {
            const value = selectOptions[
                category as keyof typeof selectOptions
            ].find((option: any) => option.label === item.name)?.value

            if (value) {
                bold = filters[category].values.includes(value)
            }
        }

        return {
            label: item.name,
            value: dollarValueFormatter(item.value),
            colour: item.color,
            bold,
        }
    })

    return <TooltipContent title={label} items={items} />
}

export function rechartCategoriesTooltipContentFunction(props: any) {
    return <RechartCategoriesTooltipContent {...props} />
}
