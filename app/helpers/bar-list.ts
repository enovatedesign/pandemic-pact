import { createContext } from 'react'
import { Colours, coloursByField } from './colours'

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
