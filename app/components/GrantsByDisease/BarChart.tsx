import { Fragment, useContext, useMemo } from 'react'
import { sumNumericGrantAmounts } from '../../helpers/reducers'
import { GlobalFilterContext } from '../../helpers/filters'
import selectOptions from '../../../data/dist/select-options.json'
import { diseaseColours, diseaseDimColours } from '../../helpers/colours'
import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'

interface Props {
    hideCovid: boolean
}

export default function BarChart({ hideCovid }: Props) {
    const { grants } = useContext(GlobalFilterContext)

    const chartData = useMemo(() => {
        const diseases = selectOptions.Disease.filter(
            disease => !hideCovid || disease.label !== 'COVID-19'
        )

        return diseases
            .map(function (disease) {
                const grantsWithKnownAmounts = grants
                    .filter((grant: any) =>
                        grant.Disease.includes(disease.value)
                    )
                    .filter(
                        (grant: any) =>
                            typeof grant.GrantAmountConverted === 'number'
                    )

                const grantsWithUnspecifiedAmounts = grants
                    .filter((grant: any) =>
                        grant.Disease.includes(disease.value)
                    )
                    .filter(
                        (grant: any) =>
                            typeof grant.GrantAmountConverted !== 'number'
                    )

                const moneyCommitted = grantsWithKnownAmounts.reduce(
                    ...sumNumericGrantAmounts
                )

                return {
                    'Category Label': disease.label,
                    'Category Value': disease.value,
                    'Grants With Known Financial Commitments':
                        grantsWithKnownAmounts.length,
                    'Grants With Unspecified Financial Commitments':
                        grantsWithUnspecifiedAmounts.length,
                    'Total Grants':
                        grantsWithKnownAmounts.length +
                        grantsWithUnspecifiedAmounts.length,
                    'Known Financial Commitments (USD)': moneyCommitted,
                }
            })
            .filter(disease => disease['Total Grants'] > 0)
    }, [grants, hideCovid])

    return (
        <BarList
            data={chartData}
            brightColours={diseaseColours}
            dimColours={diseaseDimColours}
        >
            {chartData.map((datum: any, index: number) => (
                <Fragment key={datum['Category Value']}>
                    <BarListRowHeading>
                        <p className="text-gray-600 text-sm">
                            {datum['Category Label']}
                        </p>
                    </BarListRowHeading>

                    <BarListRow dataIndex={index} />
                </Fragment>
            ))}
        </BarList>
    )
}
