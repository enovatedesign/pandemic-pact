import {millify} from 'millify'

export const dollarValueFormatter = (value: number) => {

    // Updated code to ensure values are always displayed to 2 decimal places as the millify library doesn't have a way to set this directly.

    const formattedValue = millify(value, { precision: 2 });
    const suffix = formattedValue.replace(/[\d.]+/, '');
    const numberWithTwoDecimals = parseFloat(formattedValue).toFixed(2);

    return '$' + numberWithTwoDecimals + suffix;
}

export const axisDollarFormatter = (value: number) => {
    return '$' + millify(value, {precision: 0})
}