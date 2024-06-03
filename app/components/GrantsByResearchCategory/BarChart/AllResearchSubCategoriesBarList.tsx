import { Fragment, useContext, useMemo } from 'react'
import { GlobalFilterContext } from '../../../helpers/filters'
import { sumNumericGrantAmounts } from '../../../helpers/reducers'
import {
    researchSubCategoryColours,
    researchSubCategoryDimColours,
} from '../../../helpers/colours'
import { BarListData } from '../../../helpers/bar-list'
import BarList from '../../BarList/BarList'
import BarListRow from '../../BarList/BarListRow'
import BarListRowHeading from '../../BarList/BarListRowHeading'
import BackToParentButton from '../../BackToParentButton'
import selectOptions from '../../../../data/dist/select-options.json'

interface Props {
    setSelectedCategory: (category: string | null) => void
}

export default function AllResearchSubCategoriesBarList({
    setSelectedCategory,
}: Props) {
    const { grants } = useContext(GlobalFilterContext)

    const [subCategoriesGroupedByParent, subCategories] = useMemo(() => {
        const subCategoriesGroupedByParent: {
            researchCategoryLabel: string
            researchSubCategoryData: BarListData
        }[] = selectOptions.ResearchCat.map(
            ({
                label: researchCategoryLabel,
                value: researchCategoryValue,
            }) => {
                const researchSubCategoryData =
                    selectOptions.ResearchSubcat.filter(
                        ({ parent }: { parent: string }) =>
                            parent === researchCategoryValue
                    ).map(function (researchSubCategory) {
                        const grantsWithKnownAmounts = grants
                            .filter((grant: any) =>
                                grant.ResearchSubcat.includes(
                                    researchSubCategory.value
                                )
                            )
                            .filter(
                                (grant: any) =>
                                    typeof grant.GrantAmountConverted ===
                                    'number'
                            )

                        const grantsWithUnspecifiedAmounts = grants
                            .filter((grant: any) =>
                                grant.ResearchSubcat.includes(
                                    researchSubCategory.value
                                )
                            )
                            .filter(
                                (grant: any) =>
                                    typeof grant.GrantAmountConverted !==
                                    'number'
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

                return {
                    researchCategoryLabel,
                    researchSubCategoryData,
                }
            }
        )

        const subCategories = subCategoriesGroupedByParent.flatMap(
            ({ researchSubCategoryData }) => researchSubCategoryData
        )

        return [subCategoriesGroupedByParent, subCategories]
    }, [grants])

    return (
        <>
            <BackToParentButton
                label="Viewing All Sub-Categories"
                onClick={() => setSelectedCategory(null)}
            />

            <BarList
                data={subCategories}
                brightColours={researchSubCategoryColours}
                dimColours={researchSubCategoryDimColours}
            >
                {subCategoriesGroupedByParent.map(
                    ({ researchCategoryLabel, researchSubCategoryData }) => (
                        <Fragment key={researchCategoryLabel}>
                            <h3 className="text-lg mb-2 mt-6 col-span-4">
                                {researchCategoryLabel}
                            </h3>

                            {researchSubCategoryData.map((datum: any) => (
                                <Fragment key={datum['Category Value']}>
                                    <BarListRowHeading>
                                        <p className="bar-chart-category-label text-gray-600 text-sm">
                                            {datum['Category Label']}
                                        </p>
                                    </BarListRowHeading>

                                    <BarListRow
                                        dataIndex={subCategories.findIndex(
                                            subCategory =>
                                                subCategory[
                                                    'Category Value'
                                                ] === datum['Category Value']
                                        )}
                                    />
                                </Fragment>
                            ))}
                        </Fragment>
                    )
                )}
            </BarList>
        </>
    )
}
