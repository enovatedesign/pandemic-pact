import {millify} from 'millify'

export const dollarValueFormatter = (value: number) => {
    return '$' + millify(value, {precision: 2})
}
