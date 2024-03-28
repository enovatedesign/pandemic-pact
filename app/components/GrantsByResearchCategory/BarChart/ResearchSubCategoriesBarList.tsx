import { Fragment, useContext, useMemo } from 'react'
import { GlobalFilterContext } from '../../../helpers/filters'
import { sumNumericGrantAmounts } from '../../../helpers/reducers'
import {
    researchSubCategoryColours,
    researchSubCategoryDimColours,
} from '../../../helpers/colours'
import BarList from '../../BarList/BarList'
import BarListRow from '../../BarList/BarListRow'
import BarListRowHeading from '../../BarList/BarListRowHeading'
import BackToParentButton from '../../BackToParentButton'
import selectOptions from '../../../../data/dist/select-options.json'

interface Props {
    selectedCategory: string
    setSelectedCategory: (category: string | null) => void
}

export default function ResearchSubCategoriesBarList({
    selectedCategory,
    setSelectedCategory,
}: Props) {
    const { grants } = useContext(GlobalFilterContext)

    const chartData = useMemo(() => {
        return selectOptions.ResearchSubcat.filter(
            ({ parent }: { parent: string }) => parent === selectedCategory
        ).map(function (researchSubCategory) {
            const grantsWithKnownAmounts = grants
                .filter((grant: any) =>
                    grant.ResearchSubcat.includes(researchSubCategory.value)
                )
                .filter(
                    (grant: any) =>
                        typeof grant.GrantAmountConverted === 'number'
                )

            const grantsWithUnspecifiedAmounts = grants
                .filter((grant: any) =>
                    grant.ResearchSubcat.includes(researchSubCategory.value)
                )
                .filter(
                    (grant: any) =>
                        typeof grant.GrantAmountConverted !== 'number'
                )

            const moneyCommitted = grantsWithKnownAmounts.reduce(
                ...sumNumericGrantAmounts
            )

            return {
                'Category Value': researchSubCategory.value,
                'Category Label': researchSubCategory.label,
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
    }, [grants, selectedCategory])

    const researchCategoryLabel = selectOptions.ResearchCat.find(
        ({ value }: { value: string }) => value === selectedCategory
    )?.label

    return (
        <>
            <BackToParentButton
                label={`Viewing Sub-Categories Of ${researchCategoryLabel}`}
                onClick={() => setSelectedCategory(null)}
            />

            <BarList
                data={chartData}
                brightColours={researchSubCategoryColours}
                dimColours={researchSubCategoryDimColours}
            >
                {chartData.map((datum: any, index: number) => (
                    <Fragment key={datum['Category Value']}>
                        <BarListRowHeading>
                            <p className="bar-chart-title text-gray-600 text-sm">
                                {datum['Category Label']}
                            </p>
                        </BarListRowHeading>

                        <BarListRow dataIndex={index} />
                    </Fragment>
                ))}
            </BarList>
        </>
    )
}
