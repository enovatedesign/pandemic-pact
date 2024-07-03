import { Fragment, useContext, useMemo } from 'react'
import { GlobalFilterContext } from '../../helpers/filters'
import {
    getColoursByField,
    prepareBarListDataForCategory,
    BarListData,
} from '../../helpers/bar-list'
import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'
import BackToParentButton from '../BackToParentButton'
import selectOptions from '../../../data/dist/select-options.json'

interface Props {
    categoryField: string
    subcategoryField: string
    setSelectedCategory: (category: string | null) => void
}

export default function AllSubCategories({
    categoryField,
    subcategoryField,
    setSelectedCategory,
}: Props) {
    const { grants } = useContext(GlobalFilterContext)

    const [subCategoriesGroupedByParent, subCategories] = useMemo(() => {
        const categories =
            selectOptions[categoryField as keyof typeof selectOptions]

        const subCategoriesGroupedByParent: {
            categoryLabel: string
            subCategoryData: BarListData
        }[] = categories.map(
            ({ label: categoryLabel, value: categoryValue }) => {
                const subCategories: any =
                    selectOptions[
                        subcategoryField as keyof typeof selectOptions
                    ]

                const subCategoryData = subCategories
                    .filter(
                        ({ parent }: { parent: string }) =>
                            parent === categoryValue
                    )
                    .map((category: any) =>
                        prepareBarListDataForCategory(
                            grants,
                            category,
                            subcategoryField
                        )
                    )

                return {
                    categoryLabel,
                    subCategoryData,
                }
            }
        )

        const subCategories = subCategoriesGroupedByParent.flatMap(
            ({ subCategoryData }) => subCategoryData
        )

        return [subCategoriesGroupedByParent, subCategories]
    }, [categoryField, subcategoryField, grants])

    const { brightColours, dimColours } = getColoursByField(subcategoryField)

    return (
        <>
            <BackToParentButton
                label="Viewing All Sub-Categories"
                onClick={() => setSelectedCategory(null)}
            />

            <BarList
                data={subCategories}
                brightColours={brightColours}
                dimColours={dimColours}
            >
                {subCategoriesGroupedByParent.map(
                    ({ categoryLabel, subCategoryData }) => (
                        <Fragment key={categoryLabel}>
                            <h3 className="text-lg mb-2 mt-6 col-span-4">
                                {categoryLabel}
                            </h3>

                            {subCategoryData.map((datum: any) => (
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
