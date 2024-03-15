import { createContext } from 'react'
import { Colours } from './colours'

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
