type Reducer = [
    (accumulator: any, currentValue: any) => any,
    any,
]

// The intended usage of this array is destructuring it into the parameters of
// a reduce function on an array of grants, like so:
// grants.reduce(...sumNumericGrantAmounts)
export const sumNumericGrantAmounts: Reducer = [
    (sum: number, grant: {GrantAmountConverted: number | string}) => {
        const amountToAdd = (typeof grant.GrantAmountConverted === 'number') ?
            grant.GrantAmountConverted :
            0

        return sum + amountToAdd
    },
    0
]
