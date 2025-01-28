import { Fragment, useContext, useMemo } from 'react'
import { GlobalFilterContext } from '../../helpers/filters'
import {
    getColoursByField,
    prepareBarListDataForCategory,
    BarListData,
    isChartDataUnavailable,
} from '../../helpers/bar-list'
import BarList from '../BarList/BarList'
import BarListRow from '../BarList/BarListRow'
import BarListRowHeading from '../BarList/BarListRowHeading'
import BackToParentButton from '../BackToParentButton'
import selectOptions from '../../../data/dist/select-options.json'
import NoDataText from '../NoData/NoDataText'
import { grantsByResearchCategoriesFallbackData } from '../NoData/visualisationFallbackData'

interface Props {
    categoryField: string
    subcategoryField: string
    setSelectedCategory?: (category: string | null) => void
}

export default function AllSubCategories({
    categoryField,
    subcategoryField,
    setSelectedCategory,
}: Props) {
    const { grants } = useContext(GlobalFilterContext)

    const [subCategoriesGroupedByParent, subCategories] = useMemo(() => {
        let categories =
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
                            parent === categoryValue,
                    )
                    .map((category: any) =>
                        prepareBarListDataForCategory(
                            grants,
                            category,
                            subcategoryField,
                        ),
                    )

                return {
                    categoryLabel,
                    subCategoryData,
                }
            },
        )

        const subCategories = subCategoriesGroupedByParent.flatMap(
            ({ subCategoryData }) => subCategoryData,
        )

        return [subCategoriesGroupedByParent, subCategories]
    }, [categoryField, subcategoryField, grants])

    const { brightColours, dimColours } = getColoursByField(subcategoryField)
    
    let excludedParents: string[] = []

    subCategoriesGroupedByParent.forEach((subCategory) => {
        if (isChartDataUnavailable(subCategory.subCategoryData)) {
            excludedParents.push(subCategory.categoryLabel)
        }
    })

    const filteredSubCategoriesGroupedByParent = useMemo(() => {
        return subCategoriesGroupedByParent
            .filter(
                subCategory => !isChartDataUnavailable(subCategory.subCategoryData)
            )
    }, [subCategoriesGroupedByParent])
    
    const backToParentButtonLabel = excludedParents.length === 0 
        ? 'Viewing All Sub-Categories'
        : 'Viewing All Available Sub-Categories'

    return (
        <>
            {setSelectedCategory && (
                <BackToParentButton
                    label={backToParentButtonLabel}
                    onClick={() => setSelectedCategory(null)}
                />
            )}

            {excludedParents.length > 0 && filteredSubCategoriesGroupedByParent.length !== 0 && (
                <p className='text-brand-grey-600'>
                    <span className="font-bold">Please note: The following sub-categories are hidden due to the filters applied resulting in zero data. </span>{excludedParents.map((parent: string, index: number) => {
                        const parentLabel = index !== excludedParents.length - 1 ? `"${parent}", ` : `"${parent}".`
                        return parentLabel
                    })}
                </p>
            )}
            <BarList
                data={subCategories}
                brightColours={brightColours}
                dimColours={dimColours}
            >

                {filteredSubCategoriesGroupedByParent.length > 0 ? filteredSubCategoriesGroupedByParent.map(({ categoryLabel, subCategoryData }) => (
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
                                            ] === datum['Category Value'],
                                    )}
                                />
                            </Fragment>
                        ))}
                    </Fragment>
                )) : (
                    <div className="col-span-4">
                        <FallbackData/>
                    </div>
                )}
            </BarList>
        </>
    )
}

const FallbackData = () => {
    const { categoriesAndSubCategoriesFallback } = grantsByResearchCategoriesFallbackData
    
    const { brightColours, dimColours } = getColoursByField('ResearchCat')
    return (
        <div className="w-full relative">
            <div className="w-full blur-md">
                <BarList
                    data={categoriesAndSubCategoriesFallback}
                    brightColours={brightColours}
                    dimColours={dimColours}
                >
                    {categoriesAndSubCategoriesFallback.map((datum: any, index: number) => (
                        <Fragment key={datum['Category Value']}>
                            <BarListRowHeading>
                                <p className="bar-chart-category-label text-gray-600 text-sm">
                                    {datum['Category Label']}
                                </p>

                            </BarListRowHeading>

                            <BarListRow dataIndex={index} />
                        </Fragment>
                    ))}
                </BarList>
            </div>

            <NoDataText/>
        </div>
    )
}