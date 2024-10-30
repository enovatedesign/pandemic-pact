import { createContext } from 'react'
import { Colours, coloursByField } from './colours'
import { sumNumericGrantAmounts } from './reducers'

export interface BarListDatum {
    'Known Financial Commitments (USD)': number
    'Grants With Known Financial Commitments': number
    'Grants With Unspecified Financial Commitments': number
    'Total Grants': number
    'Category Label': string
    'Category Value': string
}

export type BarListData = Array<BarListDatum>

export const BarListContext = createContext<{
    data: BarListData
    brightColours: Colours
    dimColours: Colours
    maxTotalNumberOfGrants: number
    maxAmountCommitted: number
}>({
    data: [],
    brightColours: {},
    dimColours: {},
    maxTotalNumberOfGrants: 0,
    maxAmountCommitted: 0,
})

export function getColoursByField(field: string) {
    const brightColours =
        coloursByField[field as keyof typeof coloursByField].bright

    const dimColours = coloursByField[field as keyof typeof coloursByField].dim

    return { brightColours, dimColours }
}

export function prepareBarListDataForCategory(
    grants: any[],
    category: { value: string; label: string },
    field: string
) {
    const grantsWithKnownAmounts = grants
        .filter((grant: any) => grant[field].includes(category.value))
        .filter((grant: any) => typeof grant.GrantAmountConverted === 'number')

    const grantsWithUnspecifiedAmounts = grants
        .filter((grant: any) => grant[field].includes(category.value))
        .filter((grant: any) => typeof grant.GrantAmountConverted !== 'number')

    const moneyCommitted = grantsWithKnownAmounts.reduce(
        ...sumNumericGrantAmounts
    )

    return {
        'Category Value': category.value,
        'Category Label': category.label,
        'Grants With Known Financial Commitments':
            grantsWithKnownAmounts.length,
        'Grants With Unspecified Financial Commitments':
            grantsWithUnspecifiedAmounts.length,
        'Total Grants':
            grantsWithKnownAmounts.length + grantsWithUnspecifiedAmounts.length,
        'Known Financial Commitments (USD)': moneyCommitted,
    }
}
